# PaletteLab — Original Color Discovery Platform

3,900+ mathematically generated palettes, photo color extractor, spacebar harmonic generator, WCAG contrast matrix, gradient studio, and color encyclopedia.

**No scraping. No trademarks. 100% original.** All palettes generated via HSL / golden-ratio math in `src/utils/semanticColorEngine.ts` and `src/utils/colorUtils.ts`.

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev   # http://localhost:3000
```

No API key required. Semantic generation is local, sub-1ms, zero cost.

## Build

```bash
npm run build  # generates sitemap + vite build + server bundle
npm start
```

## Monetization Setup (Individual — No Company Needed)

1.  Buy domain e.g. `palettelab.app` (Namecheap ~$12/yr) or `palettelab.com`
2.  Deploy to **Vercel** (free) or **Cloud Run** — set `APP_URL` env.
3.  Create accounts:
    *   **Google Search Console** — verify domain, submit `https://yourdomain.com/sitemap.xml`
    *   **Google Analytics 4** — get `G-XXXXXXXXXX`, add to `.env` as `GA_MEASUREMENT_ID` then uncomment tag in `index.html`
    *   **Google AdSense** — apply after you have Privacy/Terms/Contact pages (already included in `public/`). Add `ca-pub-XXXXXXXXXXXXXXXX` to `.env` and `public/ads.txt`.
4.  Legal pages are in `public/privacy.html`, `public/terms.html` — replace `[Your Name]` with your individual name.

See `MONETIZATION.md` for step-by-step AdSense approval checklist.

## Data Safety

*   `src/data/generated_palettes.json` — 3800 algorithmic palettes (HSL jitter + golden ratio)
*   `src/data/originalSeeds.json` — 120 hand-curated originals
*   No ColorHunt/Coolors/ColorHex code or data shipped.

## Tech

React 19, Vite 6, Tailwind 4, Express 4. Code-split, lazy-loaded heavy views for <350KB initial JS.
