import { ColorInfo, ColorBlindnessType } from '../types';

/**
 * Standardize hex string (e.g. 'fff' -> '#FFFFFF', '#264653' -> '#264653', 'hsl(200, 50%, 60%)' -> '#4D99B3', 'rgb(255, 0, 0)' -> '#FF0000')
 */
export function normalizeHex(input: string): string {
  if (!input) return '#000000';
  let str = input.trim();

  // Handle HSL format: hsl(200, 50%, 60%) or hsla(...)
  const hslMatch = str.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%?\s*,\s*(\d+(?:\.\d+)?)%?/i);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Handle RGB format: rgb(255, 100, 50) or rgba(...)
  const rgbMatch = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return rgbToHex(r, g, b);
  }

  let clean = str.replace(/^#/, '').trim();

  // If 3 hex characters (e.g. "F00")
  if (clean.length === 3 && /^[0-9A-Fa-f]{3}$/.test(clean)) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${clean.toUpperCase()}`;
  }

  // If 4 hex characters with alpha (e.g. "F00F")
  if (clean.length === 4 && /^[0-9A-Fa-f]{4}$/.test(clean)) {
    clean = clean
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
    return `#${clean.toUpperCase()}`;
  }

  // If 8 hex characters with alpha (e.g. "FF0000FF")
  if (clean.length === 8 && /^[0-9A-Fa-f]{8}$/.test(clean)) {
    clean = clean.slice(0, 6);
    return `#${clean.toUpperCase()}`;
  }

  // If 6 hex characters
  if (clean.length === 6 && /^[0-9A-Fa-f]{6}$/.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }

  // If 1-5 hex characters from Math.random() or typing, pad start with 0
  if (clean.length > 0 && clean.length < 6 && /^[0-9A-Fa-f]+$/.test(clean)) {
    return `#${clean.padStart(6, '0').toUpperCase()}`;
  }

  return '#000000';
}

/**
 * Convert Hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const norm = normalizeHex(hex).slice(1);
  const r = parseInt(norm.substring(0, 2), 16) || 0;
  const g = parseInt(norm.substring(2, 4), 16) || 0;
  const b = parseInt(norm.substring(4, 6), 16) || 0;
  return { r, g, b };
}

/**
 * Convert RGB to Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360 + 360) % 360 / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Convert RGB to XYZ (D65)
 */
export function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  let rL = r / 255;
  let gL = g / 255;
  let bL = b / 255;

  rL = rL > 0.04045 ? Math.pow((rL + 0.055) / 1.055, 2.4) : rL / 12.92;
  gL = gL > 0.04045 ? Math.pow((gL + 0.055) / 1.055, 2.4) : gL / 12.92;
  bL = bL > 0.04045 ? Math.pow((bL + 0.055) / 1.055, 2.4) : bL / 12.92;

  rL *= 100;
  gL *= 100;
  bL *= 100;

  const x = rL * 0.4124 + gL * 0.3576 + bL * 0.1805;
  const y = rL * 0.2126 + gL * 0.7152 + bL * 0.0722;
  const z = rL * 0.0193 + gL * 0.1192 + bL * 0.9505;

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    z: Number(z.toFixed(2)),
  };
}

/**
 * Convert RGB to CIE-LAB
 */
export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const xyz = rgbToXyz(r, g, b);
  // Observer= 2°, Illuminant= D65
  let x = xyz.x / 95.047;
  let y = xyz.y / 100.0;
  let z = xyz.z / 108.883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const bVal = 200 * (y - z);

  return {
    l: Number(l.toFixed(2)),
    a: Number(a.toFixed(2)),
    b: Number(bVal.toFixed(2)),
  };
}

/**
 * Relative Luminance (WCAG 2.1)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Contrast Ratio between two HEX colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

// Curated dictionary of 80+ distinct design color names
const NAMED_COLORS: { name: string; hex: string }[] = [
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Charcoal', hex: '#1F2937' },
  { name: 'Gunmetal', hex: '#264653' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Cool Gray', hex: '#9CA3AF' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Off White', hex: '#F9FAFB' },
  { name: 'Cream', hex: '#FEF9C3' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Crimson Red', hex: '#DC2626' },
  { name: 'Ruby', hex: '#E11D48' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Coral', hex: '#FB7185' },
  { name: 'Flamingo Pink', hex: '#EC4899' },
  { name: 'Pastel Pink', hex: '#FBCFE8' },
  { name: 'Deep Orange', hex: '#EA580C' },
  { name: 'Tangerine', hex: '#F97316' },
  { name: 'Burnt Orange', hex: '#E76F51' },
  { name: 'Sandy Gold', hex: '#F4A261' },
  { name: 'Sun Yellow', hex: '#EAB308' },
  { name: 'Mustard', hex: '#E9C46A' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Lemon Chiffon', hex: '#FEF08A' },
  { name: 'Lime Green', hex: '#84CC16' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Forest Green', hex: '#047857' },
  { name: 'Persian Green', hex: '#2A9D8F' },
  { name: 'Mint', hex: '#6EE7B7' },
  { name: 'Sage Green', hex: '#84A98C' },
  { name: 'Olive Drab', hex: '#6B705C' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Deep Teal', hex: '#0F766E' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Electric Blue', hex: '#3B82F6' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Midnight Blue', hex: '#0F172A' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Deep Indigo', hex: '#4338CA' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Lavender', hex: '#C084FC' },
  { name: 'Fuchsia', hex: '#D946EF' },
  { name: 'Plum', hex: '#701A75' },
  { name: 'Warm Taupe', hex: '#B08968' },
  { name: 'Espresso', hex: '#4A2810' },
  { name: 'Mocha', hex: '#7F4F24' },
  { name: 'Warm Beige', hex: '#E6CCB2' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Copper', hex: '#B87333' },
  { name: 'Aquamarine', hex: '#7FFFD4' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Coral Reef', hex: '#FF7F50' },
  { name: 'Peach Puff', hex: '#FFDAB9' },
  { name: 'Cadet Blue', hex: '#5F9EA0' },
  { name: 'Steel Blue', hex: '#4682B4' },
  { name: 'Dark Orchid', hex: '#9932CC' },
  { name: 'Seafoam Green', hex: '#93E9BE' },
  { name: 'Celadon', hex: '#ACE1AF' },
];

/**
 * Find closest human readable color name
 */
export function getColorName(hex: string): string {
  const norm = normalizeHex(hex);
  const rgb = hexToRgb(norm);

  let closestName = 'Custom Shade';
  let minDistance = Infinity;

  for (const item of NAMED_COLORS) {
    const itemRgb = hexToRgb(item.hex);
    // Euclidean distance in RGB space
    const dist = Math.sqrt(
      Math.pow(rgb.r - itemRgb.r, 2) +
      Math.pow(rgb.g - itemRgb.g, 2) +
      Math.pow(rgb.b - itemRgb.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = item.name;
    }
  }

  // If exact match or close
  if (minDistance === 0) return closestName;
  if (minDistance < 35) return closestName;
  return `${closestName} Tone`;
}

/**
 * Returns comprehensive ColorInfo object
 */
export function getColorDetails(hex: string): ColorInfo {
  const normalized = normalizeHex(hex);
  const rgb = hexToRgb(normalized);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  const isDark = lum < 0.45;
  const contrastWithWhite = getContrastRatio(normalized, '#FFFFFF');
  const contrastWithBlack = getContrastRatio(normalized, '#000000');
  const name = getColorName(normalized);

  return {
    hex: normalized,
    name,
    rgb,
    hsl,
    hsv,
    cmyk,
    lab,
    xyz,
    luminance: Number(lum.toFixed(4)),
    isDark,
    contrastWithWhite,
    contrastWithBlack,
  };
}

/**
 * 10-step / 20-step Shades, Tints, and Tones Generator (Color-Hex style)
 */
export function getDetailedShadesAndTints(hex: string, steps: number = 10): {
  tints: { hex: string; percent: number }[];
  shades: { hex: string; percent: number }[];
  tones: { hex: string; percent: number }[];
} {
  const rgb = hexToRgb(hex);

  const tints: { hex: string; percent: number }[] = [];
  const shades: { hex: string; percent: number }[] = [];
  const tones: { hex: string; percent: number }[] = [];

  for (let i = 1; i <= steps; i++) {
    const factor = i / (steps + 1);
    const percent = Math.round(factor * 100);

    // Tint: mix with #FFFFFF (255, 255, 255)
    const tR = Math.round(rgb.r + (255 - rgb.r) * factor);
    const tG = Math.round(rgb.g + (255 - rgb.g) * factor);
    const tB = Math.round(rgb.b + (255 - rgb.b) * factor);
    tints.push({ hex: rgbToHex(tR, tG, tB), percent });

    // Shade: mix with #000000 (0, 0, 0)
    const sR = Math.round(rgb.r * (1 - factor));
    const sG = Math.round(rgb.g * (1 - factor));
    const sB = Math.round(rgb.b * (1 - factor));
    shades.push({ hex: rgbToHex(sR, sG, sB), percent });

    // Tone: mix with #808080 (128, 128, 128)
    const tnR = Math.round(rgb.r + (128 - rgb.r) * factor);
    const tnG = Math.round(rgb.g + (128 - rgb.g) * factor);
    const tnB = Math.round(rgb.b + (128 - rgb.b) * factor);
    tones.push({ hex: rgbToHex(tnR, tnG, tnB), percent });
  }

  return { tints, shades, tones };
}

/**
 * Generate 7 standard color harmony schemes for a given HEX (Color-Hex style)
 */
export function getColorHarmonies(hex: string): {
  complementary: string[];
  splitComplementary: string[];
  analogous: string[];
  triadic: string[];
  tetradic: string[];
  square: string[];
  monochromatic: string[];
} {
  const norm = normalizeHex(hex);
  const rgb = hexToRgb(norm);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const makeColor = (hOffset: number, sOffset: number = 0, lOffset: number = 0) => {
    const h = (hsl.h + hOffset + 360) % 360;
    const s = Math.max(10, Math.min(95, hsl.s + sOffset));
    const l = Math.max(10, Math.min(92, hsl.l + lOffset));
    const converted = hslToRgb(h, s, l);
    return rgbToHex(converted.r, converted.g, converted.b);
  };

  return {
    complementary: [norm, makeColor(180)],
    splitComplementary: [norm, makeColor(150), makeColor(210)],
    analogous: [makeColor(-30), norm, makeColor(30)],
    triadic: [norm, makeColor(120), makeColor(240)],
    tetradic: [norm, makeColor(60), makeColor(180), makeColor(240)],
    square: [norm, makeColor(90), makeColor(180), makeColor(270)],
    monochromatic: [
      makeColor(0, -10, -25),
      makeColor(0, -5, -12),
      norm,
      makeColor(0, 5, 15),
      makeColor(0, 10, 28),
    ],
  };
}

/**
 * Color Blindness Simulation Matrices (Brettel / Machado)
 */
export function simulateColorBlindness(hex: string, type: ColorBlindnessType): string {
  if (type === 'normal') return normalizeHex(hex);

  const rgb = hexToRgb(hex);
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Gamma to linear
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let simR = r;
  let simG = g;
  let simB = b;

  switch (type) {
    case 'protanopia': // No L-cones (red blind)
      simR = 0.56667 * r + 0.43333 * g + 0.0 * b;
      simG = 0.55833 * r + 0.44167 * g + 0.0 * b;
      simB = 0.0 * r + 0.24167 * g + 0.75833 * b;
      break;
    case 'protanomaly':
      simR = 0.81667 * r + 0.18333 * g + 0.0 * b;
      simG = 0.33333 * r + 0.66667 * g + 0.0 * b;
      simB = 0.0 * r + 0.125 * g + 0.875 * b;
      break;
    case 'deuteranopia': // No M-cones (green blind)
      simR = 0.625 * r + 0.375 * g + 0.0 * b;
      simG = 0.7 * r + 0.3 * g + 0.0 * b;
      simB = 0.0 * r + 0.3 * g + 0.7 * b;
      break;
    case 'deuteranomaly':
      simR = 0.8 * r + 0.2 * g + 0.0 * b;
      simG = 0.25833 * r + 0.74167 * g + 0.0 * b;
      simB = 0.0 * r + 0.14167 * g + 0.85833 * b;
      break;
    case 'tritanopia': // No S-cones (blue blind)
      simR = 0.95 * r + 0.05 * g + 0.0 * b;
      simG = 0.0 * r + 0.43333 * g + 0.56667 * b;
      simB = 0.0 * r + 0.475 * g + 0.525 * b;
      break;
    case 'tritanomaly':
      simR = 0.96667 * r + 0.03333 * g + 0.0 * b;
      simG = 0.0 * r + 0.73333 * g + 0.26667 * b;
      simB = 0.0 * r + 0.18333 * g + 0.81667 * b;
      break;
    case 'achromatopsia': // Total monochromacy
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      simR = gray;
      simG = gray;
      simB = gray;
      break;
    case 'achromatomaly':
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      simR = 0.6 * r + 0.4 * lum;
      simG = 0.6 * g + 0.4 * lum;
      simB = 0.6 * b + 0.4 * lum;
      break;
  }

  // Linear back to gamma
  const toGamma = (val: number) => {
    val = Math.max(0, Math.min(1, val));
    return val > 0.0031308 ? 1.055 * Math.pow(val, 1 / 2.4) - 0.055 : 12.92 * val;
  };

  const finalR = Math.round(toGamma(simR) * 255);
  const finalG = Math.round(toGamma(simG) * 255);
  const finalB = Math.round(toGamma(simB) * 255);

  return rgbToHex(finalR, finalG, finalB);
}

/**
 * Generate Harmonic Palette for generator
 */
export function generateHarmonicPalette(baseHex?: string, count: number = 5): string[] {
  let baseH = Math.floor(Math.random() * 360);
  let baseS = Math.floor(Math.random() * 45) + 40;
  let baseL = Math.floor(Math.random() * 40) + 30;

  if (baseHex) {
    const rgb = hexToRgb(baseHex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    baseH = hsl.h;
    baseS = hsl.s;
    baseL = hsl.l;
  }

  const harmonyTypes = ['analogous', 'complementary', 'triadic', 'split', 'modern'];
  const type = harmonyTypes[Math.floor(Math.random() * harmonyTypes.length)];

  const colors: string[] = [];

  if (type === 'analogous') {
    const step = 22;
    for (let i = 0; i < count; i++) {
      const h = (baseH + (i - Math.floor(count / 2)) * step + 360) % 360;
      const s = Math.max(25, Math.min(85, baseS + (i % 2 === 0 ? 10 : -10)));
      const l = Math.max(15, Math.min(88, 20 + i * (65 / (count - 1))));
      const rgb = hslToRgb(h, s, l);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  } else if (type === 'complementary') {
    const complementH = (baseH + 180) % 360;
    for (let i = 0; i < count; i++) {
      const isComp = i >= Math.floor(count / 2);
      const h = ((isComp ? complementH : baseH) + (i * 12) + 360) % 360;
      const s = Math.max(30, Math.min(80, baseS + (i % 2 ? 8 : -8)));
      const l = Math.max(18, Math.min(85, 25 + (i * 14)));
      const rgb = hslToRgb(h, s, l);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  } else if (type === 'triadic') {
    for (let i = 0; i < count; i++) {
      const h = (baseH + (i * 120) + (i * 8)) % 360;
      const s = Math.max(35, Math.min(80, baseS - 5 + (i * 6)));
      const l = Math.max(20, Math.min(82, 30 + ((i % 3) * 20)));
      const rgb = hslToRgb(h, s, l);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  } else {
    for (let i = 0; i < count; i++) {
      const h = (baseH + (i * 35)) % 360;
      const s = Math.max(20, Math.min(85, 40 + (i * 10)));
      const l = Math.max(15, Math.min(90, 18 + i * (68 / (count - 1))));
      const rgb = hslToRgb(h, s, l);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
  }

  return colors;
}

/**
 * Format CSS Variables
 */
export function formatCssVariables(colors: string[], name: string = 'palette'): string {
  const vars = colors
    .map((c, i) => `  --color-${i + 1}: ${c.toUpperCase()};`)
    .join('\n');
  return `/* ${name} */\n:root {\n${vars}\n}`;
}

/**
 * Format Tailwind Config
 */
export function formatTailwindConfig(colors: string[], name: string = 'palette'): string {
  const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const paletteObj = colors.reduce((acc, c, i) => {
    const key = (i + 1) * 100;
    acc[`'${key}'`] = `'${c.toUpperCase()}'`;
    return acc;
  }, {} as Record<string, string>);

  const colorEntries = Object.entries(paletteObj)
    .map(([k, v]) => `        ${k}: ${v},`)
    .join('\n');

  return `// Tailwind CSS Config Extension\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${sanitized}': {\n${colorEntries}\n        }\n      }\n    }\n  }\n};`;
}

/**
 * Detect general tone of a hex
 */
export function detectColorTone(hex: string): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (hsl.l < 18) return 'dark';
  if (hsl.l > 86 && hsl.s < 20) return 'light';
  if (hsl.s < 15) return 'neutral';

  const h = hsl.h;
  if (h >= 345 || h < 15) return 'red';
  if (h >= 15 && h < 45) return 'orange';
  if (h >= 45 && h < 70) return 'yellow';
  if (h >= 70 && h < 165) return 'green';
  if (h >= 165 && h < 195) return 'teal';
  if (h >= 195 && h < 260) return 'blue';
  if (h >= 260 && h < 310) return 'purple';
  if (h >= 310 && h < 345) return 'pink';

  return 'neutral';
}

/**
 * Comprehensive Photo Color Extraction Analysis Result
 */
export interface ExtractedColorItem {
  hex: string;
  name: string;
  percentage: number;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  isDark: boolean;
}

export interface DeepPhotoAnalysis {
  dominant: ExtractedColorItem[];
  vibrant: ExtractedColorItem[];
  pastel: ExtractedColorItem[];
  shadows: ExtractedColorItem[];
  highlights: ExtractedColorItem[];
  warm: ExtractedColorItem[];
  cool: ExtractedColorItem[];
  allClusters: ExtractedColorItem[];
  totalSampledPixels: number;
}

/**
 * Extract Dominant Colors from an HTML Image or Canvas using Median-Cut Clustering
 */
export function extractColorsFromImageData(imageData: ImageData, colorCount: number = 5): string[] {
  const analysis = extractDeepPhotoAnalysis(imageData, colorCount);
  return analysis.dominant.map((c) => c.hex);
}

/**
 * Deep Multi-Thematic Photo Color Analysis Engine
 */
export function extractDeepPhotoAnalysis(imageData: ImageData, dominantCount: number = 6): DeepPhotoAnalysis {
  const data = imageData.data;
  const pixelCount = data.length / 4;
  const rawPixels: { r: number; g: number; b: number }[] = [];

  // Adaptive sampling (sample up to 15,000 pixels for accuracy & performance)
  const step = Math.max(1, Math.floor(pixelCount / 15000));
  for (let i = 0; i < pixelCount; i += step) {
    const offset = i * 4;
    const a = data[offset + 3];
    if (a >= 128) {
      rawPixels.push({
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
      });
    }
  }

  if (rawPixels.length === 0) {
    const fallbackHexes = ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'];
    const fallbackDominant = fallbackHexes.map((hex, idx) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return {
        hex,
        name: getColorName(hex),
        percentage: Math.round(100 / fallbackHexes.length),
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        isDark: hsl.l < 50,
      };
    });

    return {
      dominant: fallbackDominant,
      vibrant: fallbackDominant,
      pastel: fallbackDominant,
      shadows: fallbackDominant,
      highlights: fallbackDominant,
      warm: fallbackDominant,
      cool: fallbackDominant,
      allClusters: fallbackDominant,
      totalSampledPixels: 0,
    };
  }

  // Median-cut algorithm that also tracks cluster size
  interface SizedBucket {
    pixels: { r: number; g: number; b: number }[];
  }

  const runMedianCut = (pixels: { r: number; g: number; b: number }[], targetCount: number): SizedBucket[] => {
    let buckets: SizedBucket[] = [{ pixels }];

    while (buckets.length < targetCount) {
      let bestIdx = -1;
      let maxRange = -1;
      let bestChannel: 'r' | 'g' | 'b' = 'r';

      buckets.forEach((b, idx) => {
        if (b.pixels.length <= 2) return;
        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;

        for (const p of b.pixels) {
          if (p.r < minR) minR = p.r;
          if (p.r > maxR) maxR = p.r;
          if (p.g < minG) minG = p.g;
          if (p.g > maxG) maxG = p.g;
          if (p.b < minB) minB = p.b;
          if (p.b > maxB) maxB = p.b;
        }

        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
        const range = Math.max(rangeR, rangeG, rangeB);

        // Weigh by bucket pixel count so huge color blocks split evenly
        const weightedRange = range * Math.sqrt(b.pixels.length);

        if (weightedRange > maxRange) {
          maxRange = weightedRange;
          bestIdx = idx;
          bestChannel = rangeR >= rangeG && rangeR >= rangeB ? 'r' : rangeG >= rangeB ? 'g' : 'b';
        }
      });

      if (bestIdx === -1 || maxRange <= 0) break;

      const target = buckets[bestIdx];
      target.pixels.sort((p1, p2) => p1[bestChannel] - p2[bestChannel]);
      const median = Math.floor(target.pixels.length / 2);

      const b1: SizedBucket = { pixels: target.pixels.slice(0, median) };
      const b2: SizedBucket = { pixels: target.pixels.slice(median) };

      buckets.splice(bestIdx, 1, b1, b2);
    }

    return buckets;
  };

  // 1. Generate 24 micro-clusters for complete granular color discovery
  const allMicroBuckets = runMedianCut(rawPixels, 24);
  const totalPixels = rawPixels.length;

  const allItems: ExtractedColorItem[] = allMicroBuckets
    .filter((b) => b.pixels.length > 0)
    .map((b) => {
      let sumR = 0, sumG = 0, sumB = 0;
      for (const p of b.pixels) {
        sumR += p.r;
        sumG += p.g;
        sumB += p.b;
      }
      const len = b.pixels.length;
      const r = Math.round(sumR / len);
      const g = Math.round(sumG / len);
      const bVal = Math.round(sumB / len);
      const hex = rgbToHex(r, g, bVal);
      const hsl = rgbToHsl(r, g, bVal);
      const percentage = Math.max(0.5, Math.round((len / totalPixels) * 1000) / 10);

      return {
        hex,
        name: getColorName(hex),
        percentage,
        r,
        g,
        b: bVal,
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        isDark: hsl.l < 50,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Helper to deduplicate colors by perceptual distance
  const colorDistance = (c1: ExtractedColorItem, c2: ExtractedColorItem): number => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const dedupeAndSlice = (items: ExtractedColorItem[], limit: number = 6, threshold: number = 28): ExtractedColorItem[] => {
    const result: ExtractedColorItem[] = [];
    for (const item of items) {
      const tooClose = result.some((r) => colorDistance(r, item) < threshold);
      if (!tooClose) {
        result.push(item);
      }
      if (result.length >= limit) break;
    }
    return result.length > 0 ? result : items.slice(0, limit);
  };

  // 2. Extract Thematic Palettes
  // Dominant: Top frequency items sorted by coverage
  const dominant = dedupeAndSlice(allItems, dominantCount, 32);

  // Vibrant: High saturation and healthy lightness
  const vibrantCandidates = [...allItems].sort((a, b) => {
    // Score based on saturation and moderate lightness
    const scoreA = a.s * 1.5 - Math.abs(a.l - 50);
    const scoreB = b.s * 1.5 - Math.abs(b.l - 50);
    return scoreB - scoreA;
  });
  const vibrant = dedupeAndSlice(vibrantCandidates, Math.min(dominantCount, 6), 25);

  // Pastel / Muted: Gentle saturation, light to medium lightness
  const pastelCandidates = allItems
    .filter((c) => c.s <= 65 && c.l >= 45 && c.l <= 92)
    .sort((a, b) => b.l - a.l);
  const pastel = dedupeAndSlice(pastelCandidates.length >= 3 ? pastelCandidates : allItems, Math.min(dominantCount, 6), 20);

  // Shadows / Dark: Low lightness, moody undertones
  const shadowCandidates = allItems
    .filter((c) => c.l <= 45)
    .sort((a, b) => a.l - b.l);
  const shadows = dedupeAndSlice(shadowCandidates.length >= 3 ? shadowCandidates : allItems, Math.min(dominantCount, 6), 22);

  // Highlights / Light: High lightness
  const highlightCandidates = allItems
    .filter((c) => c.l >= 55)
    .sort((a, b) => b.l - a.l);
  const highlights = dedupeAndSlice(highlightCandidates.length >= 3 ? highlightCandidates : allItems, Math.min(dominantCount, 6), 20);

  // Warm: Red, Orange, Yellow, Warm Browns (Hue: 330-80 deg)
  const warmCandidates = allItems
    .filter((c) => (c.h >= 330 || c.h <= 75) && c.s >= 15)
    .sort((a, b) => b.percentage - a.percentage);
  const warm = dedupeAndSlice(warmCandidates.length >= 3 ? warmCandidates : allItems, Math.min(dominantCount, 6), 20);

  // Cool: Cyan, Blue, Teal, Violet, Green (Hue: 80-320 deg)
  const coolCandidates = allItems
    .filter((c) => c.h > 75 && c.h < 330 && c.s >= 15)
    .sort((a, b) => b.percentage - a.percentage);
  const cool = dedupeAndSlice(coolCandidates.length >= 3 ? coolCandidates : allItems, Math.min(dominantCount, 6), 20);

  return {
    dominant,
    vibrant,
    pastel,
    shadows,
    highlights,
    warm,
    cool,
    allClusters: allItems,
    totalSampledPixels: totalPixels,
  };
}
