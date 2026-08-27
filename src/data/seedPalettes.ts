import { Palette } from '../types';
import generatedPalettes from './generated_palettes.json';

// Curated 105 original hand-crafted palettes remain fully owned.
// Generated palettes are 100% algorithmic (math-based HSL + golden ratio), no scraping, no trademark infringement.

export const CATEGORIES = [
  { key: 'all', name: 'All Palettes' },
  { key: 'trending', name: 'Trending' },
  { key: 'warm', name: 'Warm' },
  { key: 'cool', name: 'Cool' },
  { key: 'pastel', name: 'Pastel' },
  { key: 'vibrant', name: 'Vibrant' },
  { key: 'dark', name: 'Dark' },
  { key: 'neutral', name: 'Neutral' },
  { key: 'nature', name: 'Nature' },
  { key: 'minimal', name: 'Minimal' },
  { key: 'luxury', name: 'Luxury' },
];

// Original 105 — extract from previous file to keep, then merge with generated.
import originalSeeds from './originalSeeds.json';

export const INITIAL_PALETTES: Palette[] = [
  ...(generatedPalettes as Palette[]),
  ...(originalSeeds as Palette[]),
];
