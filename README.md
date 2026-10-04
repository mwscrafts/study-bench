# Study Bench

An original static anatomy learning website with interactive comparisons and two downloadable PDFs.

Public website: https://studybench.mwscrafts.workers.dev/

## Files

`dist/` contains the complete website. No build step is needed. `wrangler.json` targets the existing Cloudflare Worker named `studybench` and serves only static assets. This configuration adds no server script, database, checkout, or paid plan.

## Automatic updates through GitHub

The `main` branch is connected to the existing Cloudflare Worker named `studybench`. Every commit to `main` triggers a Cloudflare build and deploys the contents of `dist/` automatically.

The Worker name in the dashboard must remain `studybench` to match `wrangler.json`. Cloudflare manages the build authorization token; no password or token belongs in this repository.

Official setup: https://developers.cloudflare.com/workers/ci-cd/builds/

## Manual upload fallback

For the existing dashboard upload flow, upload the contents of `dist/` with `index.html` at the upload root. Do not upload the GitHub source ZIP as website assets: its `dist/` folder is intentionally nested.

## Search and a future domain

The current source allows indexing, has a canonical URL, and includes `robots.txt` and `sitemap.xml`. These take effect on Cloudflare only after the updated files are deployed there. Search indexing and rankings are not guaranteed.

If the public URL changes, update the canonical and Open Graph URL in `dist/index.html`, the sitemap URL in `dist/robots.txt`, and the page URL in `dist/sitemap.xml` together.

## Local checks

Run `node --check dist/app.js` to check JavaScript syntax. The page and downloads can also be opened locally; no package installation is required to edit the site.
