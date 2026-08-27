import { Palette } from '../types';

// Lightweight immediate bundle: only hand-curated originals (120). 
// 7800 generated palettes are fetched at runtime from /generated_palettes.json — cuts main JS by ~1.4MB.
import originalSeeds from './originalSeeds.json';

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

export const INITIAL_PALETTES: Palette[] = [...(originalSeeds as Palette[])];

// Async loader for the 7800+ generated chunk — fetch only, not bundled (fire-and-forget scale).
let generatedCache: Palette[] | null = null;
export async function loadGeneratedPalettes(): Promise<Palette[]> {
  if (generatedCache) return generatedCache;
  try {
    const res = await fetch('/generated_palettes.json', { cache: 'force-cache' });
    if (!res.ok) return [];
    const data = (await res.json()) as Palette[];
    generatedCache = data;
    return data;
  } catch {
    return [];
  }
}
