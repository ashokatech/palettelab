import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateSemanticPalette } from './src/utils/semanticColorEngine';
import { buildPaletteHeadTags, buildColorHeadTags, baseUrl } from './src/utils/seoUtils';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type SeededPalette = { name: string; slug: string; colors: string[]; category: string; creator?: { name?: string } };

function loadPaletteIndex(): Map<string, SeededPalette> {
  const map = new Map<string, SeededPalette>();
  const files = [
    path.join(process.cwd(), 'dist', 'generated_palettes.json'),
    path.join(process.cwd(), 'src', 'data', 'generated_palettes.json'),
    path.join(process.cwd(), 'src', 'data', 'originalSeeds.json'),
  ];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf-8')) as SeededPalette[];
      for (const p of data) if (p && p.slug && !map.has(p.slug)) map.set(p.slug, p);
    } catch {
      // file optional at runtime
    }
  }
  return map;
}

function buildColorEncyclopediaContent(hex: string): { title: string; description: string; bodyHtml: string } {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  const hsl = {
    h: Math.round((r===g && g===b) ? 0 : r>g ? (g-b)/(1-Math.abs(2*Math.max(r,g,b)-1-Math.min(r,g,b)))*60+(r>=g?0:360) : ((g-b)/(1-Math.abs(2*Math.max(r,g,b)-1-Math.min(r,g,b))))*60+(g>=b?0:360)),
    s: Math.round(Math.max(r,g,b)===0 ? 0 : (Math.max(r,g,b)-Math.min(r,g,b))/(1-Math.abs(2*Math.max(r,g,b)-1-Math.min(r,g,b)))*100),
    l: Math.round((Math.max(r,g,b)+Math.min(r,g,b))/2*100)
  };
  const hexStr = `#${h.toUpperCase()}`;
  const rgbStr = `RGB(${r}, ${g}, ${b})`;
  const colorFamilies: Record<string, string[]> = {
    red: ['Red','Crimson','Vermillion','Scarlet','Ruby'],
    orange: ['Orange','Amber','Coral','Peach','Tangerine'],
    yellow: ['Yellow','Gold','Amber','Lemon','Canary'],
    green: ['Green','Emerald','Forest','Mint','Jade'],
    blue: ['Blue','Navy','Azure','Cerulean','Indigo'],
    purple: ['Purple','Violet','Mauve','Lavender','Plum'],
    pink: ['Pink','Rose','Blush','Coral','Salmon'],
    teal: ['Teal','Cyan','Aqua','Turquoise','Seafoam'],
    neutral: ['Neutral','Gray','Charcoal','Beige','Stone'],
  };
  let family = 'neutral';
  for (const [f, colors] of Object.entries(colorFamilies)) {
    const hue = hsl.h;
    if (f==='red' && (hue>=340 || hue<20)) { family='red'; break; }
    if (f==='orange' && hue>=20 && hue<40) { family='orange'; break; }
    if (f==='yellow' && hue>=40 && hue<70) { family='yellow'; break; }
    if (f==='green' && hue>=70 && hue<170) { family='green'; break; }
    if (f==='blue' && hue>=170 && hue<260) { family='blue'; break; }
    if (f==='purple' && hue>=260 && hue<300) { family='purple'; break; }
    if (f==='pink' && hue>=300 && hue<340) { family='pink'; break; }
    if (f==='teal' && hue>=160 && hue<190) { family='teal'; break; }
    if (f==='neutral' && (hsl.s<10 || hsl.l>90 || hsl.l<15)) { family='neutral'; break; }
  }
  const meanings: Record<string, string> = {
    red: 'Red is the color of energy, passion, and urgency. It increases heart rate and creates a sense of excitement. In design, red draws immediate attention — perfect for CTAs, warnings, and accent walls. Culturally, it symbolizes luck in China and love in the West.',
    orange: 'Orange combines the energy of red and the happiness of yellow. It represents enthusiasm, creativity, and warmth. Orange is less intense than red but still grabs attention — widely used in adventure sports branding and food packaging.',
    yellow: 'Yellow is the color of sunshine, optimism, and clarity. It stimulates mental activity and generates positive energy. Use yellow for caution signs and cheerful branding — it’s the most visible color from a distance.',
    green: 'Green is the color of nature, growth, and harmony. It represents renewal, health, and tranquility. Green has a calming effect on the mind and is associated with sustainability, finance, and environmental awareness.',
    blue: 'Blue evokes trust, stability, and intelligence. It lowers heart rate and creates a sense of calm — the most universally liked color. Corporate, fintech, and healthcare brands rely on blue to project credibility and professionalism.',
    purple: 'Purple combines the stability of blue and the energy of red. It symbolizes luxury, wisdom, and creativity. Historically reserved for royalty, purple signals premium quality and is popular in beauty and anti-aging products.',
    pink: 'Pink represents romance, compassion, and tenderness. It embodies softness and nurturing energy. From bubblegum to femininity, pink ranges from bold and confident to delicate and soothing — universally recognized in culture.',
    teal: 'Teal is a sophisticated blend of blue and green, representing sophistication and clarity. It balances the calm of blue with the renewal of green. Teal is popular in modern design for its refreshing, oceanic undertones.',
    neutral: 'Neutral colors — gray, beige, charcoal — are the backbone of sophisticated design. They provide visual rest, complement bold accents, and convey professionalism. Neutrals are timeless and work across every industry.',
  };
  const relatedPalettes = [`${hexStr} Analogous`, `${hexStr} Monochromatic`, `${hexStr} Complementary`, `${hexStr} Triadic`];
  const bodyHtml = `<p><strong>${hexStr} Color Meaning:</strong> ${meanings[family] || meanings.neutral}</p>
<p><strong>Technical values:</strong> ${rgbStr} — HSL(${Math.round(hsl.h)}°, ${hsl.s}%, ${hsl.l}%).</p>
<p><strong>Color family:</strong> ${family.charAt(0).toUpperCase()+family.slice(1)}. Related tones: ${relatedPalettes.join(', ')}.</p>
<p>Use <strong>${hexStr}</strong> in UI backgrounds, text, buttons, or as part of a 5-color harmony. Check its <a href="/?tab=color-detail&hex=${hexStr.replace('#','')}">WCAG contrast</a> against white and dark backgrounds.</p>`;
  const title = `${hexStr} Hex Color — Meaning, HSL(${Math.round(hsl.h)}°, ${hsl.s}%, ${hsl.l}%), RGB, WCAG Contrast & Related Palettes | PaletteLab`;
  const description = `Complete breakdown of ${hexStr}: ${rgbStr}, HSL(${Math.round(hsl.h)}°, ${hsl.s}%, ${hsl.l}%), color meaning & psychology, WCAG AA/AAA contrast ratios, and matching palettes. Free, no sign-up.`;
  return { title, description, bodyHtml };
}

function injectHead(indexHtml: string, headTags: string): string {
  let html = indexHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/i, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, '');
  return html.replace(/<\/head>/i, `    ${headTags}\n  </head>`);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Zero-cost Semantic Color Palette Synthesizer endpoint
  app.post('/api/generate-ai-palette', (req, res) => {
    try {
      const { prompt, count = 5 } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const result = generateSemanticPalette(prompt, count);
      return res.json(result);
    } catch (err: any) {
      console.error('Error generating palette:', err);
      res.status(500).json({ error: 'Failed to generate palette' });
    }
  });

  // Simple OG image for Pinterest/SEO share (fire-and-forget traffic)
  app.get('/api/og/:slug.png', (req, res) => {
    const slug = String(req.params.slug || 'palette');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0a0a0a"/><text x="60" y="120" font-family="sans-serif" font-size="48" font-weight="800" fill="white">PaletteLab</text><text x="60" y="180" font-family="sans-serif" font-size="28" fill="#a1a1aa">${slug.replace(/-/g,' ')}</text><text x="60" y="560" font-family="sans-serif" font-size="18" fill="#71717a">7,900+ original palettes — ${baseUrl()}</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  });

  // Vite integration for development & static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const paletteIndex = loadPaletteIndex();
    const shellHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    app.use(express.static(distPath, { index: false }));

    // SSR-lite: serve the SPA shell but inject per-page SEO head so crawlers & social see unique content.
    // Supports clean paths: /palette/{slug}, /color/{hex}
    // Also redirects old query-param URLs to clean paths for Google.
    app.get('*', (req, res, next) => {
      if (
        req.path.startsWith('/api/') ||
        req.path === '/sitemap.xml' ||
        req.path === '/robots.txt' ||
        req.path === '/ads.txt' ||
        /\.[a-z0-9]+$/i.test(req.path)
      ) {
        return next();
      }
      // Clean-path handling
      const cleanPath = req.path.replace(/\/$/, '');
      const paletteMatch = cleanPath.match(/^\/palette\/([a-z0-9][a-z0-9\-]*[a-z0-9])$/);
      const colorMatch = cleanPath.match(/^\/color\/([0-9a-fA-F]{3,6})$/);

      let headTags = '';
      let slug: string | undefined;
      let hex: string | undefined;

      if (paletteMatch) {
        slug = paletteMatch[1];
        const p = paletteIndex.get(slug.toLowerCase());
        if (p) {
          headTags = buildPaletteHeadTags({
            name: p.name,
            slug: p.slug,
            colors: p.colors,
            category: p.category,
            creatorName: p.creator?.name,
          });
        }
      } else if (colorMatch) {
        hex = colorMatch[1].toUpperCase();
        const normalized = `#${hex}`;
        // validate hex
        if (/^[0-9A-Fa-f]{3}$/.test(hex) || /^[0-9A-Fa-f]{6}$/.test(hex)) {
          headTags = buildColorHeadTags(normalized);
        }
      } else if (req.query.tab === 'palette-detail' && req.query.palette) {
        // Redirect old URL to clean path
        const pSlug = String(req.query.palette).toLowerCase();
        const p = paletteIndex.get(pSlug);
        if (p) {
          return res.redirect(301, `/${p.slug}`);
        }
        slug = pSlug;
      } else if (req.query.tab === 'color-detail' && req.query.hex) {
        const cHex = String(req.query.hex).replace('#','').toUpperCase();
        if (/^[0-9A-Fa-f]{3,6}$/.test(cHex)) {
          return res.redirect(301, `/color/${cHex}`);
        }
        hex = cHex;
      } else {
        // Homepage, categories, tools — let SPA handle
        const html = shellHtml;
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.send(html);
      }

      if (headTags) {
        const html = injectHead(shellHtml, headTags);
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.send(html);
      }
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(shellHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaletteLab server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
