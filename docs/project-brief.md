# Project direction and release standards

## Goal

Build a credible, profitable science-learning publishing business. The website is the discovery and trust layer; revenue should come from finished, useful products, not a pile of loosely related pages. Profitability is a goal, not a claim about current results.

## Audience and scope

- Students: high school through university, including anatomy and nursing prerequisites. Clearly label difficulty and prerequisites.
- Kids and young explorers: age-appropriate science stories, illustrated activities and puzzles, used by families and educators.
- Subjects: human biology; microscopic worlds; plants, fungi and insects; ponds, coasts and oceans; rocks, minerals and Earth science.
- Original microscopy and field observations are a potential differentiator. Nova Scotia can supply examples without limiting the audience geographically. Do not assume visitors own microscopes.

Maintain Home, Lessons, Printables, About and Contact as separate pages. Classify new resources by subject, format and level. Do not create empty categories just to fill the navigation. Keep the homepage short and retain its growing-collection notice.

## First commercial test — proposed, not launched

Start with an anatomy colouring-and-retrieval-practice pack for introductory students. It fits the existing lessons and free worksheets, making it a focused test rather than an unrelated new product line.

The paid product must add real value: accurate printable illustrations, scaffolded recall activities, explanatory answer keys, clear level labels and a simple study sequence. Keep a genuinely useful free sample. The current free anatomy PDFs remain free; do not relabel them as premium without adding and reviewing value.

Discovery path: a specific useful lesson or microscopy video → related free sample → product page showing exact contents and preview → transparent price and checkout. Only add the product page and checkout when the reviewed pack exists and the owner approves the sales provider, currency, price and terms. No fake purchase buttons, invented testimonials, guarantees, or premature paid integration.

Later tests may include children's illustrated science adventures, microscopic-world activity books, field journals, and a professionally printed edition. Release one validated product before expanding paid categories. Advertising is not the first revenue model.

Track visits to relevant lessons, sample downloads, product-page visits, actual sales and refunds. Validate willingness to pay before commissioning a large catalogue. No assumed conversion rates, market sizes or revenue forecasts.

## Brand decision remains open

An active education product already uses StudyBench at studybench.com. Treat the current name as provisional. Rebranding is necessary before serious promotion or investment in branded products, but preserve the existing work and wait for owner approval of a checked replacement.

Check exact and similar names in web/education/publishing search, relevant trademark databases, domain registration and hosting availability. A vacant domain or no exact-match result is not legal clearance. Do not promise a URL before the hosting provider confirms it can be claimed.

If the name or URL changes, update site copy, metadata, email subjects, PDF branding, canonical URLs, sitemap and robots together. Plan redirects and Search Console verification before moving traffic. Do not silently migrate hosting or change the account-wide Cloudflare subdomain.

## Publishing checklist

1. Inspect the current repository and live state. State the specific change before making it. Major branding, layout, pricing and platform decisions need owner agreement.
2. Change the smallest relevant set of files. Preserve unrelated work and existing URLs.
3. Run `python3 scripts/check_site.py` and `python3 -m unittest discover -s tests -v` before committing. These checks are manual and do not gate Cloudflare automatically.
4. Review mobile navigation, legibility, keyboard interaction and print output when affected. Check scientific explanations, diagrams, answers, sources and commercial-use permissions before release. Automated structural checks cannot establish content accuracy or accessibility compliance.
5. Verify the deployed files with `python3 scripts/check_site.py --live`. Report exactly what changed and any remaining limits. Never claim email sent, a sale completed, a deployment verified, or Google indexing succeeded without evidence.
