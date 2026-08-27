# PaletteLab — Monetization Playbook (Solo Individual, No Company Needed)

You said you want money and will do whatever. This is the ordered plan. Do step 1 before step 4.

## Phase 0 — Foundation (You are here, done)

- [x] 3920 original palettes (120 curated + 3800 algorithmic) — legally safe, no ColorHunt/Coolors/ColorHex data
- [x] Bundle split, lazy heavy views, SEO truth-fix, privacy/terms/ads.txt, sitemap with ~3947 URLs

## Phase 1 — Get Domain + Go Live (Week 1, Cost ~$12-30)

1.  **Buy domain:** Namecheap / Cloudflare Registrar. Recommendation: `palettelab.app` if available, fallback `getpalettelab.com`, `palettelab.design`, `palettelab.co`. `.app` requires HTTPS — good for SEO. Avoid hyphens.
2.  **Deploy:** Vercel recommended for solo (zero server cost, auto HTTPS, global CDN).
    ```bash
    npm i -g vercel
    vercel --prod
    # set env APP_URL=https://yourdomain.com in Vercel dashboard
    ```
    Alternative: Cloud Run (`Dockerfile` already via `server.ts` + `dist/server.cjs`).
3.  **Verify domain:** Google Search Console → Domain property → Add TXT record → Submit `https://yourdomain.com/sitemap.xml`.

## Phase 2 — Analytics (Day 2, Free)

1.  Create GA4 property at analytics.google.com → Get `G-XXXXXXXXXX`.
2.  In Vercel env add `GA_MEASUREMENT_ID=G-XXXXXXXXXX`, in `index.html` uncomment the gtag block (already prepared placeholder removed — re-add with real ID).
3.  Track events: already `copyValue` and `generateRandomPalette` emit; you will see top palettes within 48h.

## Phase 3 — AdSense Approval (Week 2-3, Where Money Starts)

AdSense rejects 90% of thin sites. You will pass because we fixed the Wrapper:

**Checklist before you apply (adsense.google.com):**
- [ ] Domain live with HTTPS
- [ ] `/privacy.html` and `/terms.html` linked in footer (TODO: add footer links) — replace `[Your Name]` with legal name
- [ ] `/ads.txt` with real line after approval (AdSense gives you `google.com, pub-..., DIRECT, ...`)
- [ ] Contact page with real email (`hello@...`)
- [ ] At least 30 indexed pages (you have 3947 via sitemap — Google will index within days)
- [ ] No placeholder AdSense code in `index.html` (already removed — add only after approval)

**After approval:** Add to `.env` / Vercel env:
```
ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
Add script tag back to `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```
`AdContainer.tsx` already gates on `ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER'` — it will auto-render real ads.

**Expected CPM for design niche:** $4-12. At 10k pageviews/mo = $40-120. At 100k = $400-1200.

## Phase 4 — Upsell (Month 2+, Higher Margin than Ads)

- Pro export: `ASE / .sketchpalette / Figma tokens` for $7 one-time via Gumroad/LemonSqueezy. Code already exports CSS/Tailwind — adding ASE is 40 lines.
- Affiliate: Link to Figma, Coolors Pro, Adobe CC — 10-30% commission.

## Solo Individual — Legal Notes

- No company needed for AdSense/GA4. You file as individual (1099 / local sole proprietor equivalent).
- Privacy Policy already says "individual" — update name/email after domain purchase.
- Keep `robots.txt` + `sitemap.xml` — required for SEO.

## Your Next Actions (I need you to do these, I cannot)

1. Reply with chosen domain (I will then update `index.html` canonical + sitemap baseUrl + package metadata).
2. Tell me when Vercel deployed — I will wire GA4/AdSense live.
3. Create GA4 + Search Console accounts — share IDs and I place them correctly (no placeholders).

Do NOT re-add ColorHunt/Coolors data. Keep 100% original — that's your moat and your legal shield.
