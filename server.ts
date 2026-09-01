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

function injectHead(indexHtml: string, headTags: string): string {
  // Remove the static SPA title/description/canonical so the per-page ones win, then inject.
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
      const tab = req.query.tab as string | undefined;
      let headTags = '';
      if (tab === 'palette-detail' && req.query.palette) {
        const p = paletteIndex.get(String(req.query.palette).toLowerCase());
        if (p) {
          headTags = buildPaletteHeadTags({
            name: p.name,
            slug: p.slug,
            colors: p.colors,
            category: p.category,
            creatorName: p.creator?.name,
          });
        }
      } else if (tab === 'color-detail' && req.query.hex) {
        headTags = buildColorHeadTags(String(req.query.hex));
      }
      const html = headTags ? injectHead(shellHtml, headTags) : shellHtml;
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send(html);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaletteLab server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
