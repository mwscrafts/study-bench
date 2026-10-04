# Study Bench

An original static anatomy learning website with interactive comparisons and two downloadable PDFs.

Public website: https://studybench.mwscrafts.workers.dev/

## Files

`dist/` contains the complete website. No build step is needed. `wrangler.json` targets the existing Cloudflare Worker named `studybench` and serves only static assets. This configuration adds no server script, database, checkout, or paid plan.

## Automatic updates through GitHub

The source repository is ready. The remaining setup is to connect it to the existing Cloudflare Worker.

1. In Cloudflare, open **Workers & Pages → studybench → Settings → Builds → Connect**. Connect GitHub and select the `mwscrafts/study-bench` repository.
2. Use these options:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Root directory | Repository root |
   | Build command | Leave empty |
   | Deploy command | `npx wrangler deploy` |

   Cloudflare can generate the build authorization token automatically. No password or token needs to be put into the source code or shared in chat.
3. Save the configuration. The first build should deploy the current `main` branch to the existing Worker.
4. Confirm the build succeeds and the Worker has a new active deployment before treating the update as live.

The Worker name in the dashboard must remain `studybench` to match the configuration. Future pushes to the connected branch can publish updates automatically.

Official setup: https://developers.cloudflare.com/workers/ci-cd/builds/

## Manual upload fallback

For the existing dashboard upload flow, upload the contents of `dist/` with `index.html` at the upload root. Do not upload the GitHub source ZIP as website assets: its `dist/` folder is intentionally nested.

## Search and a future domain

The current source allows indexing, has a canonical URL, and includes `robots.txt` and `sitemap.xml`. These take effect on Cloudflare only after the updated files are deployed there. Search indexing and rankings are not guaranteed.

If the public URL changes, update the canonical and Open Graph URL in `dist/index.html`, the sitemap URL in `dist/robots.txt`, and the page URL in `dist/sitemap.xml` together.

## Local checks

Run `node --check dist/app.js` to check JavaScript syntax. The page and downloads can also be opened locally; no package installation is required to edit the site.
