#!/usr/bin/env python3
"""Dependency-free static-site checks. Run from any directory."""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NAV = ['index.html', 'lessons.html', 'printables.html', 'about.html', 'contact.html']
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'


class Page(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.navs = [], [], {}
        self.meta, self.canonicals, self.title = {}, [], ''
        self.h1 = 0
        self.lang = None
        self.missing_alt = 0
        self.in_head = self.in_title = False
        self.nav = None
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if tag == 'html':
            self.lang = a.get('lang')
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'img' and 'alt' not in a:
            self.missing_alt += 1
        if tag == 'meta':
            self.meta.setdefault(a.get('name', a.get('property')), []).append(a.get('content', ''))
        if tag == 'title' and self.in_head:
            self.in_title = True
        if tag == 'link' and 'canonical' in a.get('rel', '').split():
            self.canonicals.append(a.get('href', ''))
        if tag == 'nav':
            self.nav = a.get('aria-label')
            self.navs.setdefault(self.nav, [])
        if tag == 'a' and self.nav:
            self.navs[self.nav].append(a.get('href', ''))
        for key in ('href', 'src'):
            if a.get(key):
                self.refs.append(a[key])

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if tag == 'title':
            self.in_title = False
        if tag == 'nav':
            self.nav = None

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def check_site(dist):
    errors = []
    files = sorted(dist.glob('*.html'))
    pages = {p.name: Page(p.read_text(encoding='utf-8')) for p in files}
    if 'index.html' not in pages or len(pages['index.html'].canonicals) != 1:
        return ['Homepage must have one canonical URL'], pages, ''
    origin = pages['index.html'].canonicals[0]
    if not origin.startswith('https://') or urlsplit(origin).path != '/' or urlsplit(origin).query:
        errors.append('Homepage canonical must be an HTTPS origin ending in /')
    expected_urls = set()
    for name, page in pages.items():
        expected = origin if name == 'index.html' else urljoin(origin, name)
        expected_urls.add(expected)
        def require(condition, message):
            if not condition:
                errors.append(f'{name}: {message}')
        require(bool(page.lang), 'missing document language')
        require(bool(page.title.strip()), 'missing title')
        require(page.h1 == 1, 'must have exactly one h1')
        require(page.canonicals == [expected], 'canonical does not match page URL')
        require(page.meta.get('og:url') == [expected], 'Open Graph URL mismatch')
        require(bool(page.meta.get('description', [''])[0].strip()), 'missing description')
        require('width=device-width' in page.meta.get('viewport', [''])[0], 'missing mobile viewport')
        require(not page.missing_alt, 'image missing alt attribute')
        for id_, count in Counter(page.ids).items():
            require(count == 1, f'duplicate id {id_}')
        for label in ('Main navigation', 'Footer navigation'):
            require(page.navs.get(label) == NAV, f'{label} order or destinations differ')
        for ref in page.refs:
            resolved = urlsplit(urljoin(expected, ref))
            if (resolved.scheme, resolved.netloc) != (urlsplit(origin).scheme, urlsplit(origin).netloc):
                continue
            relative = unquote(resolved.path).lstrip('/') or 'index.html'
            target = (dist / relative).resolve()
            require(target.is_relative_to(dist.resolve()) and target.is_file(), f'missing local file: {ref}')
            if resolved.fragment and relative in pages:
                require(unquote(resolved.fragment) in pages[relative].ids, f'missing fragment: {ref}')
    try:
        sitemap = ET.parse(dist / 'sitemap.xml').getroot()
        urls = [node.text for node in sitemap.findall(f'{NS}url/{NS}loc')]
        if sitemap.tag != NS + 'urlset' or len(urls) != len(set(urls)) or set(urls) != expected_urls:
            errors.append('Sitemap must list each canonical page exactly once')
    except (OSError, ET.ParseError) as exc:
        errors.append(f'Sitemap cannot be read: {exc}')
    try:
        robots = (dist / 'robots.txt').read_text(encoding='utf-8')
        sitemap_lines = [line.strip() for line in robots.splitlines() if line.strip().lower().startswith('sitemap:')]
        if sitemap_lines != [f'Sitemap: {origin}sitemap.xml']:
            errors.append('robots.txt sitemap URL mismatch')
        if any(line.strip().lower() == 'disallow: /' for line in robots.splitlines()):
            errors.append('robots.txt blocks site-wide crawling')
    except OSError as exc:
        errors.append(f'robots.txt cannot be read: {exc}')
    for pdf in dist.glob('downloads/*.pdf'):
        if not pdf.read_bytes().startswith(b'%PDF-'):
            errors.append(f'{pdf.name}: invalid PDF signature')
    return errors, pages, origin


def check_live(dist, origin):
    """Compare deployed bytes, not just 200s that might be a fallback page."""
    def fetch(path):
        url = origin if path.name == 'index.html' else urljoin(origin, path.relative_to(dist).as_posix())
        try:
            with urlopen(Request(url, headers={'User-Agent': 'SiteQualityCheck/1.0'}), timeout=20) as response:
                body = response.read()
                if response.status != 200 or body != path.read_bytes():
                    return f'Deployed file differs or failed: {url}'
        except Exception as exc:
            return f'Live check failed: {url}: {exc}'
        return None
    files = sorted(p for p in dist.rglob('*') if p.is_file())
    with ThreadPoolExecutor(max_workers=4) as pool:
        return [error for error in pool.map(fetch, files) if error]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true', help='Compare deployed files to this source')
    args = parser.parse_args()
    dist = ROOT / 'dist'
    errors, pages, origin = check_site(dist)
    if not shutil.which('node'):
        errors.append('Node.js is required for JavaScript syntax checks')
    else:
        for script in sorted(dist.glob('*.js')):
            result = subprocess.run(['node', '--check', str(script)], capture_output=True, text=True)
            if result.returncode:
                errors.append(f'{script.name}: {result.stderr.strip()}')
    if args.live and not errors:
        errors.extend(check_live(dist, origin))
    if errors:
        print('\n'.join(f'FAIL: {error}' for error in errors))
        return 1
    print(f'PASS: {len(pages)} pages; links, navigation, metadata, sitemap, PDFs and JavaScript.'
          + (' Deployed files match source.' if args.live else ''))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
