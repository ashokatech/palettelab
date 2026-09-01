/**
 * SEO & Structured Data Utilities for PaletteLab
 * Schema.org CreativeWork + ColorPalette + DefinedTerm.
 * Server-safe (no DOM, no window) so both SSR head-injection and client can share it.
 */

export interface PaletteSeoInput {
  name: string;
  slug: string;
  colors: string[];
  category: string;
  creatorName?: string;
  description?: string;
}

const DEFAULT_BASE = 'https://palettelab.co';

export function baseUrl(): string {
  const env: any = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) || {};
  return (env.APP_URL || env.VITE_APP_URL || DEFAULT_BASE).replace(/\/$/, '');
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function paletteTitle(p: PaletteSeoInput): string {
  return `${p.name} Color Palette (${p.colors.join(', ')}) - PaletteLab`;
}

export function paletteDescription(p: PaletteSeoInput): string {
  const by = p.creatorName ? ` by ${p.creatorName}` : '';
  return `Explore the ${p.name} ${p.category.toLowerCase()} color scheme${by}: ${p.colors.length} harmonious hex codes (${p.colors.join(', ')}) with one-click CSS, Tailwind & SVG export, WCAG contrast and a live UI mockup.`;
}

export function paletteCanonical(p: PaletteSeoInput, base = baseUrl()): string {
  return `${base}/${p.slug}`;
}

export function generatePaletteJsonLd(p: PaletteSeoInput, base = baseUrl()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${p.name} Color Palette`,
    url: paletteCanonical(p, base),
    description: paletteDescription(p),
    keywords: `${p.category.toLowerCase()}, color palette, hex codes, ${p.colors.join(', ')}, design tokens`,
    genre: 'Graphic Design & Color Systems',
    author: { '@type': 'Organization', name: 'PaletteLab', url: base },
    color: p.colors,
  };
}

/** Full injectable <head> tag string for a palette page (title, meta, OG, Twitter, JSON-LD). */
export function buildPaletteHeadTags(p: PaletteSeoInput, base = baseUrl()): string {
  const title = paletteTitle(p);
  const desc = paletteDescription(p);
  const canonical = paletteCanonical(p, base);
  const ogImage = `${base}/api/og/${p.slug}.png`;
  const jsonLd = JSON.stringify(generatePaletteJsonLd(p, base)).replace(/</g, '\\u003c');
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(ogImage)}">`,
    `<meta property="og:site_name" content="PaletteLab">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(ogImage)}">`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}

// ---- Color encyclopedia ----

function hexToRgbObj(hex: string) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

export function colorNameHex(hex: string) {
  return `Color ${hex.toUpperCase()}`;
}

export function colorTitle(hex: string) {
  return `${hex.toUpperCase()} Hex Color — RGB, HSL, CMYK, Harmonies, Meaning & WCAG Contrast | PaletteLab`;
}

export function colorDescription(hex: string) {
  const { r, g, b } = hexToRgbObj(hex);
  return `Complete breakdown of ${hex.toUpperCase()}: RGB(${r}, ${g}, ${b}), HSL, CMYK, tints & shades, color blindness simulation, WCAG AA/AAA contrast ratios and matching color palettes. Free, no sign-up.`;
}

export function colorCanonical(hex: string, base = baseUrl()): string {
  return `${base}/color/${hex.replace('#', '')}`;
}

export function generateColorEncyclopediaJsonLd(hex: string, base = baseUrl()) {
  const { r, g, b } = hexToRgbObj(hex);
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: `Color ${hex.toUpperCase()}`,
    termCode: hex.toUpperCase(),
    description: colorDescription(hex),
    url: colorCanonical(hex, base),
    inDefinedTermSet: 'Hexadecimal Color Space',
    color: `${hex.toUpperCase()} rgb(${r}, ${g}, ${b})`,
  };
}

/** Full injectable <head> tag string for a color-detail page. */
export function buildColorHeadTags(hex: string, base = baseUrl()): string {
  const title = colorTitle(hex);
  const desc = colorDescription(hex);
  const canonical = colorCanonical(hex, base);
  const ogImage = `${base}/api/og/color-${hex.replace('#', '')}.png`;
  const jsonLd = JSON.stringify(generateColorEncyclopediaJsonLd(hex, base)).replace(/</g, '\\u003c');
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(ogImage)}">`,
    `<meta property="og:site_name" content="PaletteLab">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ');
}
