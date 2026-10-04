"""Prove the checks catch regressions, rather than only passing good input."""
import importlib.util
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('check_site', ROOT / 'scripts/check_site.py')
CHECKS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECKS)


class SiteChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.dist = Path(self.temp.name) / 'dist'
        shutil.copytree(ROOT / 'dist', self.dist)

    def replace(self, file, old, new):
        path = self.dist / file
        content = path.read_text(encoding='utf-8')
        self.assertIn(old, content)
        path.write_text(content.replace(old, new, 1), encoding='utf-8')

    def errors(self):
        return CHECKS.check_site(self.dist)[0]

    def test_current_site(self):
        self.assertEqual(self.errors(), [])

    def test_missing_link(self):
        self.replace('index.html', 'href="lessons.html"', 'href="missing.html"')
        self.assertTrue(any('missing local file' in e for e in self.errors()))

    def test_missing_fragment(self):
        self.replace('index.html', '#evidence-title', '#missing-heading')
        self.assertTrue(any('missing fragment' in e for e in self.errors()))

    def test_navigation_order(self):
        self.replace('index.html', 'href="lessons.html">Lessons', 'href="printables.html">Lessons')
        self.assertTrue(any('navigation order' in e for e in self.errors()))

    def test_canonical_mismatch(self):
        self.replace('contact.html', 'rel="canonical" href="https://studybench.mwscrafts.workers.dev/contact.html"',
                     'rel="canonical" href="https://example.com/contact.html"')
        self.assertTrue(any('canonical does not match' in e for e in self.errors()))

    def test_sitemap_omission(self):
        self.replace('sitemap.xml', '<url><loc>https://studybench.mwscrafts.workers.dev/contact.html</loc><lastmod>2026-10-04</lastmod></url>', '')
        self.assertTrue(any('Sitemap must list' in e for e in self.errors()))

    def test_robots_mismatch(self):
        self.replace('robots.txt', '/sitemap.xml', '/missing.xml')
        self.assertTrue(any('robots.txt sitemap URL mismatch' in e for e in self.errors()))

    def test_duplicate_id(self):
        self.replace('index.html', '<section class="hero wrap">', '<section class="hero wrap" id="main">')
        self.assertTrue(any('duplicate id' in e for e in self.errors()))

    def test_invalid_pdf(self):
        (self.dist / 'downloads/anatomical-directions-free-worksheet.pdf').write_bytes(b'not a pdf')
        self.assertTrue(any('invalid PDF' in e for e in self.errors()))


if __name__ == '__main__':
    unittest.main()
