/**
 * SEO & Microdata Generator Utilities for PaletteLab
 * Powered by Schema.org CreativeWork & ColorPalette specifications
 * Designed to achieve Google #1 Rankings for Color Queries
 */

export interface PaletteSeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  jsonLd: Record<string, any>;
}

/**
 * Generate Schema.org JSON-LD structured microdata for Google Rich Snippets
 */
export function generatePaletteJsonLd(paletteName: string, colors: string[], category: string, slug: string) {
  const pageUrl = `https://palettelab.in/?tab=palette-detail&palette=${slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': `${paletteName} Color Palette`,
    'url': pageUrl,
    'description': `Harmonic ${category} color scheme containing ${colors.length} hex colors: ${colors.join(', ')}.`,
    'keywords': `${category}, color palette, hex codes, ${colors.join(', ')}, design tokens`,
    'genre': 'Graphic Design & Color Systems',
    'author': {
      '@type': 'Organization',
      'name': 'PaletteLab',
      'url': 'https://palettelab.in',
    },
    'color': colors,
  };
}

/**
 * Generate Schema.org JSON-LD microdata for Hex Color Encyclopedia pages
 */
export function generateColorEncyclopediaJsonLd(hex: string, rgb: string, hsl: string) {
  const pageUrl = `https://palettelab.in/?tab=color-detail&hex=${hex.replace('#', '')}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    'name': `Color ${hex}`,
    'termCode': hex,
    'description': `Comprehensive color breakdown for ${hex}: RGB(${rgb}), HSL(${hsl}), accessibility contrast analysis and harmonies.`,
    'url': pageUrl,
    'inDefinedTermSet': 'Hexadecimal Color Space',
  };
}
