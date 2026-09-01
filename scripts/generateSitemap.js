import fs from 'fs';
import path from 'path';

async function buildSitemap() {
  console.log('Generating dynamic XML sitemap for Google Search Console...');
  const baseUrl = (process.env.APP_URL || process.env.CF_PAGES_URL && `${process.env.CF_PAGES_URL}` || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'https://palettelab.in').replace(/\/$/, '');

  const generatedPath = path.join(process.cwd(), 'src', 'data', 'generated_palettes.json');
  const originalPath = path.join(process.cwd(), 'src', 'data', 'originalSeeds.json');
  const generatedPalettes = JSON.parse(fs.readFileSync(generatedPath, 'utf-8'));
  const originalSeeds = JSON.parse(fs.readFileSync(originalPath, 'utf-8'));
  const paletteMap = new Map();
  [...generatedPalettes, ...originalSeeds].forEach(p => paletteMap.set(p.slug, p));
  const allPalettes = [...paletteMap.values()];

  // Collect ALL unique hex values across all palettes for color encyclopedia pages
  const allHexSet = new Set();
  for (const p of allPalettes) {
    for (const c of (p.colors || [])) {
      const h = c.replace('#','').toUpperCase();
      if (/^[0-9A-Fa-f]{3,6}$/.test(h)) allHexSet.add(h);
    }
  }
  const allHexes = [...allHexSet].slice(0, 500); // Google index cap ~500 unique color pages

  const staticRoutes = [
    '',
    '?tab=discover',
    '?tab=generator',
    '?tab=tools&tool=image-extractor',
    '?tab=tools&tool=contrast-checker',
    '?tab=tools&tool=color-blindness',
    '?tab=tools&tool=brand-colors',
    '?tab=tools&tool=gradient-maker',
    '?tab=tools&tool=ai-studio',
    '?category=pastel',
    '?category=warm',
    '?category=cool',
    '?category=dark',
    '?category=nature',
    '?category=luxury',
    '?category=vibrant',
    '?category=minimal',
    '?category=neutral',
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  for (const route of staticRoutes) {
    const loc = route ? `${baseUrl}/${route.replace(/&/g, '&amp;')}` : baseUrl;
    xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
  }

  // Dynamic palette pages — CLEAN URLs
  for (const palette of allPalettes) {
    const loc = `${baseUrl}/${palette.slug}`;
    xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Color encyclopedia — CLEAN URLs (every unique hex)
  for (const hex of allHexes) {
    const loc = `${baseUrl}/color/${hex}`;
    xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  // Generate robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`Successfully generated sitemap.xml with ${staticRoutes.length + allPalettes.length + allHexes.length} URLs (${allPalettes.length} palettes + ${allHexes.length} color pages) in public/`);
}

buildSitemap();
