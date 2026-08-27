export interface ColorInfo {
  hex: string;
  name: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
  xyz: { x: number; y: number; z: number };
  luminance: number;
  isDark: boolean;
  contrastWithWhite: number;
  contrastWithBlack: number;
}

export type ColorBlindnessType =
  | 'normal'
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly';

export interface Palette {
  id: string;
  slug: string;
  name: string;
  colors: string[]; // Array of uppercase HEX codes like #264653
  creator: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  likes: number;
  views: number;
  copies: number;
  saves: number;
  category: string; // e.g. 'Trending', 'Pastel', 'Minimal', 'Dark', 'Nature'
  tags: string[];
  createdAt: string;
  isFeatured?: boolean;
}

export type CategoryKey =
  | 'all'
  | 'trending'
  | 'popular'
  | 'new'
  | 'random'
  | 'minimal'
  | 'pastel'
  | 'dark'
  | 'vibrant'
  | 'warm'
  | 'cool'
  | 'neutral'
  | 'luxury'
  | 'nature'
  | 'wedding'
  | 'business'
  | 'website'
  | 'ui/ux'
  | 'interior'
  | 'fashion';

export type ColorTone =
  | 'all'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'neutral'
  | 'dark'
  | 'light';

export type SortOption = 'popularity' | 'likes' | 'views' | 'date' | 'random';

export interface FilterState {
  searchQuery: string;
  category: string;
  colorTone: ColorTone;
  colorCount: number | 'all'; // 4, 5, 6, or 'all'
  sortBy: SortOption;
  lightness: 'all' | 'light' | 'dark';
  colorBlindness: ColorBlindnessType;
}

export type ActiveTab =
  | 'discover'
  | 'generator'
  | 'color-detail'
  | 'palette-detail'
  | 'tools'
  | 'collections';

export type ToolSubTab =
  | 'image-extractor'
  | 'contrast-checker'
  | 'gradient-maker'
  | 'ui-preview'
  | 'ai-studio'
  | 'shades-tints'
  | 'color-blindness'
  | 'brand-colors';

export type PaletteViewMode = 'grid' | 'mockup' | 'compact';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'copy';
  title: string;
  message?: string;
  hexPreview?: string;
}
