import fs from 'fs';
import path from 'path';

async function buildSitemap() {
  console.log('Generating dynamic XML sitemap for Google Search Console...');
  const baseUrl = 'https://palettelab.app';

  // Now uses 100% original generated + curated data — no scraped sources.
  const generatedPath = path.join(process.cwd(), 'src', 'data', 'generated_palettes.json');
  const originalPath = path.join(process.cwd(), 'src', 'data', 'originalSeeds.json');
  const generatedPalettes = JSON.parse(fs.readFileSync(generatedPath, 'utf-8'));
  const originalSeeds = JSON.parse(fs.readFileSync(originalPath, 'utf-8'));
  const allPalettes = [...generatedPalettes, ...originalSeeds];

  const staticRoutes = [
    '',
    '?tab=discover',
    '?tab=generator',
    '?tab=tools&tool=image-extractor',
    '?tab=tools&tool=contrast-checker',
    '?tab=tools&tool=color-blindness',
    '?tab=tools&tool=brand-colors',
    '?tab=tools&tool=gradient-maker',
    '?tab=tools&tool=gradient-studio',
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

  // Dynamic palette pages
  for (const palette of allPalettes) {
    const loc = `${baseUrl}/?tab=palette-detail&amp;palette=${palette.slug}`;
    xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Color encyclopedia samples for top hexes
  const colorSamples = ['264653','2A9D8F','E9C46A','F4A261','E76F51','3B82F6','EF4444','10B981'];
  for (const hex of colorSamples) {
    xml += `  <url>\n    <loc>${baseUrl}/?tab=color-detail&amp;hex=${hex}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');

  // Generate robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`Successfully generated sitemap.xml with ${staticRoutes.length + allPalettes.length + colorSamples.length} URLs in public/`);
}

buildSitemap();
