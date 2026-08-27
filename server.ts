import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateSemanticPalette } from './src/utils/semanticColorEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaletteLab server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
