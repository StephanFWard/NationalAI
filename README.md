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
- `/404.html` — Not-found page.

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
src/components/     # Document, PostCard, PostList, SiteFooter, SiteHeader
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

