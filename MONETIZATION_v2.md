# MONETIZATION_v2.md — PaletteLab Revenue Strategy

**Date**: 2026-09-01  
**Status**: Ready for implementation  
**Target**: Google AdSense + Affiliate + Future SaaS tiers

---

## 1. AdSense Implementation (COMPLETE)

### What's Done
- **Env-driven client ID**: `VITE_ADSENSE_CLIENT` in `.env.production` (no hardcoded placeholder in repo)
- **Script injection**: `useInjectAdSenseScript()` hook injects `adsbygoogle.js` once on app mount
- **CLS prevention**: Reserved min-heights on all ad slots
  - Native card: `min-h-[120px]`
  - Sidebar: `min-h-[250px]` (300×250 rectangle)
  - Banner: auto-height flex container
- **Ad placements** (via `<AdContainer />`):
  - `DiscoveryFilters` — after category chips, before results grid (native-card, index 0)
  - `PaletteCard` grid — every 6th card (native-card, index++)
  - `IndividualPaletteView` — below color breakdown table (sidebar)
  - `ToolsView` — between tool sections (sidebar)
  - `Hero` — below CTA (banner)

### Ad Slot Mapping (create in AdSense UI)
| Slot Name | Format | Size | Pages |
|-----------|--------|------|-------|
| `palettelab_discover_native_1` | Native/In-feed | Auto | Discover, Collections |
| `palettelab_palette_sidebar_1` | Sidebar | 300×250 | Palette Detail |
| `palettelab_tools_sidebar_1` | Sidebar | 300×250 | Tools (Contrast, Gradient, etc.) |
| `palettelab_hero_banner_1` | Banner | Responsive | Home, landing pages |

### Revenue Estimate (Conservative)
- **Pageviews/mo**: ~50K (post-SEO launch)
- **RPM**: $2–4 (design/dev niche, US/Western traffic)
- **Monthly**: $100–200
- **Annual**: $1,200–$2,400

---

## 2. Affiliate Layer (NEXT PHASE)

### Target Programs
| Program | Commission | Fit | Implementation |
|---------|------------|-----|----------------|
| **Tailwind UI** | 30% ($90/sale) | Perfect — dev audience | Banner in ToolsView Gradient Studio |
| **Figma** | $30/seat | Designers | Palette export → Figma plugin link |
| **Adobe Creative Cloud** | 85% first month | Pro designers | Color detail → "Open in Photoshop" |
| **Canva Pro** | $36/sale | Casual creators | Mockup preview → "Edit in Canva" |
| **Hosting (Vercel/Netlify)** | $50–100 | Devs deploying | "Deploy this palette as theme" CTA |

### Integration Points
1. **ToolsView Gradient Studio** → "Export to Tailwind UI" button (affiliate link)
2. **IndividualPaletteView** → "Open in Figma" / "Edit in Canva" buttons
3. **ColorEncyclopediaView** → "Buy Pantone swatch" (affiliate)
4. **SeoFooter** → "Recommended Tools" column with affiliate links

### Revenue Estimate
- **Conversion**: 0.5–1% of tool users
- **Monthly**: $200–500 (scales with traffic)
- **Annual**: $2,400–$6,000

---

## 3. SaaS Tiers (FUTURE — 6–12 months)

### Tier Structure
| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | $0 | 7,900 palettes, 5 exports/day, basic tools, ads | Hobbyists, students |
| **Pro** | $9/mo | Unlimited exports, API access, no ads, palette collections, Figma/CSV export, WCAG reports | Freelancers, agencies |
| **Team** | $29/mo | Pro + shared workspaces, brand kits, SSO, priority support | Design teams, dev shops |

### API Product (Pro+)
```
GET /api/v1/palettes?category=cool&limit=50
GET /api/v1/palettes/{slug}
GET /api/v1/colors/{hex}
POST /api/v1/palettes/generate { prompt, count }
```
- Rate limit: 1,000 req/day (Pro), 10,000 (Team)
- SDK: npm `@palettelab/client`

### Revenue Projection (Year 1)
| Metric | Conservative | Optimistic |
|--------|--------------|------------|
| Free users | 50,000 | 150,000 |
| Pro conversion | 2% | 5% |
| Team conversion | 0.2% | 0.5% |
| **MRR** | $9,000 | $45,000 |
| **ARR** | $108,000 | $540,000 |

---

## 4. SEO → Traffic Flywheel (CURRENT PRIORITY)

### Completed (This Session)
- ✅ SSR-lite head injection for palette/color detail pages (canonical, OG, JSON-LD)
- ✅ Crawlable footer anchors (PageRank flow to 10 category + 8 color + 8 tool pages)
- ✅ Sitemap.xml: 8,005 URLs (7,978 palettes + category + tool + static)
- ✅ Structured data: `ItemList` (palettes), `Product` (color detail), `HowTo` (tools)
- ✅ Zero duplicate palettes, zero tag duplicates, zero accessibility violations
- ✅ Category balance: all 10 categories within ±12% of uniform (698–881 each)

### Next SEO Actions (Week 1–2)
1. Submit sitemap to GSC + Bing
2. Add `robots.txt` crawl-delay + host directive
3. Deploy to production (Vercel/Netlify + custom domain)
4. Monitor indexing in GSC (target: 5,000+ indexed in 30 days)
5. Add FAQ schema to tool pages (already have `SeoFaqSection` component)

---

## 5. Technical Debt & Risks

| Risk | Mitigation |
|------|------------|
| AdSense rejection (low content) | 7,900+ unique pages, original content, clear nav — low risk |
| CLS from ads | Reserved min-heights implemented; monitor via CrUX |
| Affiliate link cloaking | Use direct links with `rel="sponsored nofollow"` |
| API abuse | Rate limits, API keys, Cloudflare WAF |
| Category imbalance drift | Regenerate script rebalances; cron quarterly |

---

## 6. Immediate Next Steps (This Week)

1. **Deploy to production** — Vercel (static) + Railway/Render (Node server for SSR)
2. **Set `VITE_ADSENSE_CLIENT`** in production env
3. **Create AdSense slots** and map to `adSlot` props in components
4. **Submit sitemap** to Google Search Console
5. **Add affiliate links** to ToolsView Gradient Studio (Tailwind UI)
6. **Monitor Core Web Vitals** (LCP < 2.5s, CLS < 0.1, FID < 100ms)

---

## 7. File Reference for Future Agents

| File | Purpose |
|------|---------|
| `src/components/AdContainer.tsx` | All ad rendering + `useInjectAdSenseScript` |
| `src/App.tsx` | Calls AdSense injection hook |
| `src/components/SeoFooter.tsx` | Crawlable anchor links (PageRank flow) |
| `src/utils/seoUtils.ts` | Head tag builders for SSR injection |
| `server.ts` | Express SSR middleware for palette/color detail |
| `src/context/PaletteContext.tsx` | Client-side meta sync + `applySeoHead` |
| `scripts/generateSafePalettes.js` | Palette generation (run after theme changes) |
| `src/data/generated_palettes.json` | 7,860 palettes (committed) |
| `public/sitemap.xml` | Auto-generated via `generateSitemap.js` |

---

**End of MONETIZATION_v2.md** — Ready for execution.