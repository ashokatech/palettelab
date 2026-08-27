import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateSemanticPalette } from './src/utils/semanticColorEngine';

dotenv.config();

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
    // Lightweight SVG-based OG — no canvas dep, edge-cacheable
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0a0a0a"/><text x="60" y="120" font-family="sans-serif" font-size="48" font-weight="800" fill="white">PaletteLab</text><text x="60" y="180" font-family="sans-serif" font-size="28" fill="#a1a1aa">${slug.replace(/-/g,' ')}</text><text x="60" y="560" font-family="sans-serif" font-size="18" fill="#71717a">7,900+ original palettes — palettelab.vercel.app</text></svg>`;
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
    app.use(express.static(distPath));
    // SPA fallback — but keep /api/* and /sitemap.xml from being swallowed
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/sitemap.xml' || req.path === '/robots.txt' || req.path === '/ads.txt') return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaletteLab server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
