# National AI Advancement for Human Innovation

Modern static rebuild of
<https://nationalaiadvancementforhumaninnovation.wordpress.com/> —
brighter soft-dark theme, semantic HTML5, BEM CSS, zero runtime dependencies.

Contact: `stephan.ward5@icloud.com` · `910.727.9500`.

## Pages

- `/` — Affidavit of Organizational Intent and Financial Compliance.
- `/about/` — Contact page.
- `/2024/07/11/articles-of-incorperation-6-29-2024/` — Articles of Incorporation.
- `/posts/` — Post index.
- `/work-log/` — Volunteer IT work-log estimates and the 480-hour application integration plan.
- `/analysis-search/` — Client-side USPTO patent search integrated from ai_scrape_app.
- `/404.html` — Not-found page.

## Volunteer IT work log

The [public Work Log](https://nationalai.onrender.com/work-log/) contains a clearly
identified reconstruction of the 2026 weekly work pattern and the dated
October 2026–April 2027 integration plan. Downloadable Word documents and the
underlying schedule data are in [`docs/work-log/`](docs/work-log/).

The retrospective is an estimate based on the founder's stated weekly cadence,
the currently available repository history, and the founder-reported October
migration completion. It is not a contemporaneous timecard or independently
verified record; review and correct it against personal records before relying
on it as an official accounting.

Source pages live in `src/pages/` and are composed from components in
`src/components/` (one folder per component). Global tokens and the reset live
in `src/styles/`. The builder expands `<!-- @include Name -->` blocks and
bundles the CSS into `dist/`.

## Quick start

```sh
npm run build
npm test
```

Open `dist/index.html`, or serve `dist/` with any static file server:

```sh
npx serve dist
```

## Render deployment

This repo is Render-ready as a static site:

- Build command: `npm run build`
- Publish directory: `dist`
- Optional environment variable: `SITE_URL=https://<your-service>.onrender.com`
  (used for `sitemap.xml` and `robots.txt`; defaults to
  `https://nationalai.onrender.com`)

Steps:

1. Push this repository to GitHub as a public repo.
2. In Render, choose **New → Static Site** and point it at the repo/branch.
3. Set the build command to `npm run build` and the publish directory to `dist`.
4. Deploy — no extra install step is needed (Node built-ins only).

## Repository layout

```text
build.js              # include-expanding static builder (Node built-ins only)
render.yaml           # Render static-site blueprint
src/components/     # AnalysisSearch, Document, PostCard, PostList, SiteFooter, SiteHeader
src/pages/          # index, about, posts, dated article, 404
src/styles/         # tokens.css, reset.css (global tokens only)
tests/site.test.js  # build + content + theme regression tests
dist/               # generated output (git-ignored)
```

## Notes

- Exact article/about wording is preserved; PayPal fundraiser copy, demo
  WordPress posts, and WordPress references were removed per request.
- Theme is a brighter soft-dark slate (`#232937` surfaces, `#ced6e2` text)
  without harsh black/white contrast.
