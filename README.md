# Study Bench

An original static learning website with visual anatomy lessons, science discoveries, and printable practice.

Public website: https://studybench.mwscrafts.workers.dev/

## Files

`dist/` contains the complete website. No build step is needed. `wrangler.json` targets the existing Cloudflare Worker named `studybench` and serves only static assets. This configuration adds no server script, database, checkout, or paid plan.

## Site structure

- `dist/index.html`: short homepage linking to the two collections.
- `dist/lessons.html`: lesson directory, grouped by subject.
- `dist/printables.html`: printable directory with download and print instructions.
- `dist/anatomy-foundations.html`: interactive directional terms and body planes.
- Each other lesson or activity keeps its own HTML page and existing URL.
- `dist/about.html` and `dist/contact.html`: purpose, learning approach, and contact.
- `dist/home-navigation.js`: sends old homepage section links to their new destinations.

Keep header and footer navigation in the same order on every page: Home, Lessons, Printables, About, Contact. New lessons belong in the Lessons directory; downloadable or browser-printable resources belong in Printables. Cross-link related resources rather than embedding whole lessons in the homepage. Add new public pages to `dist/sitemap.xml`.

## Automatic updates through GitHub

The `main` branch is connected to the existing Cloudflare Worker named `studybench`. Every commit to `main` triggers a Cloudflare build and deploys the contents of `dist/` automatically.

The Worker name in the dashboard must remain `studybench` to match `wrangler.json`. Cloudflare manages the build authorization token; no password or token belongs in this repository.

Official setup: https://developers.cloudflare.com/workers/ci-cd/builds/

## Manual upload fallback

For the existing dashboard upload flow, upload the contents of `dist/` with `index.html` at the upload root. Do not upload the GitHub source ZIP as website assets: its `dist/` folder is intentionally nested.

## Search and a future domain

The current source allows indexing, has a canonical URL, and includes `robots.txt` and `sitemap.xml`. These take effect on Cloudflare only after the updated files are deployed there. Search indexing and rankings are not guaranteed.

If the public URL changes, update the canonical and Open Graph URLs in every HTML page, the sitemap URL in `dist/robots.txt`, and the page URL in `dist/sitemap.xml` together.

## Local checks

Run `node --check dist/app.js` to check JavaScript syntax. The page and downloads can also be opened locally; no package installation is required to edit the site.
