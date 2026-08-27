import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Palette, FilterState, ActiveTab, ToolSubTab, ToastMessage, ColorBlindnessType } from '../types';
import { INITIAL_PALETTES } from '../data/seedPalettes';
import { generateHarmonicPalette, detectColorTone, normalizeHex } from '../utils/colorUtils';
import confetti from 'canvas-confetti';

interface GeneratorSlot {
  id: string;
  hex: string;
  isLocked: boolean;
}

interface PaletteContextType {
  palettes: Palette[];
  filteredPalettes: Palette[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPalette: Palette | null;
  openPalette: (paletteOrSlug: Palette | string) => void;
  closePalette: () => void;
  
  // Color-Hex Encyclopedia
  selectedHex: string;
  openColorDetail: (hex: string) => void;
  
  // Tools Sub-tab
  toolSubTab: ToolSubTab;
  setToolSubTab: (subTab: ToolSubTab) => void;

  likedPaletteIds: string[];
  savedPaletteIds: string[];
  toggleLike: (paletteId: string, e?: React.MouseEvent) => void;
  toggleSave: (paletteId: string, e?: React.MouseEvent) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  copyValue: (value: string, label?: string, hexPreview?: string) => Promise<void>;
  
  // Generator State
  generatorSlots: GeneratorSlot[];
  generateRandomPalette: () => void;
  toggleSlotLock: (index: number) => void;
  setSlotColor: (index: number, hex: string) => void;
  addSlot: () => void;
  removeSlot: (index: number) => void;
  setGeneratorPaletteFromColors: (colors: string[]) => void;
  saveNewPalette: (name: string, colors: string[], category?: string, tags?: string[]) => Palette;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  colorTone: 'all',
  colorCount: 'all',
  sortBy: 'popularity',
  lightness: 'all',
  colorBlindness: 'normal',
};

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    try {
      const savedCustoms = localStorage.getItem('palettelab_custom_palettes');
      const likesMapRaw = localStorage.getItem('palettelab_likes_map');
      const likesMap: Record<string, number> = likesMapRaw ? JSON.parse(likesMapRaw) : {};

      let list = INITIAL_PALETTES;
      if (savedCustoms) {
        const parsed = JSON.parse(savedCustoms);
        list = [...parsed, ...INITIAL_PALETTES];
      }

      // Restore persisted user likes count
      if (Object.keys(likesMap).length > 0) {
        return list.map((p) => (likesMap[p.id] !== undefined ? { ...p, likes: likesMap[p.id] } : p));
      }
      return list;
    } catch {
      return INITIAL_PALETTES;
    }
  });

  // Initialize state with URL parameters if present
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      const cat = params.get('category') || 'all';
      return {
        ...DEFAULT_FILTERS,
        searchQuery: q,
        category: cat,
      };
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam && ['discover', 'generator', 'color-detail', 'tools', 'collections', 'palette-detail'].includes(tabParam)) {
        return tabParam;
      }
      if (window.location.hash) {
        if (window.location.hash.startsWith('#color-')) return 'color-detail';
        if (window.location.hash.startsWith('#palette-')) return 'palette-detail';
      }
    } catch {
      // fallback
    }
    return 'discover';
  });

  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const palSlug = params.get('palette') || (window.location.hash.startsWith('#palette-') ? window.location.hash.replace('#palette-', '') : null);
      if (palSlug) {
        const found = INITIAL_PALETTES.find((p) => p.slug === palSlug.toLowerCase() || p.id === palSlug);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [selectedHex, setSelectedHex] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hexParam = params.get('hex') || (window.location.hash.startsWith('#color-') ? window.location.hash.replace('#color-', '') : null);
      if (hexParam) {
        return normalizeHex(hexParam);
      }
    } catch {
      // fallback
    }
    return '#3B82F6';
  });

  const [toolSubTab, setToolSubTab] = useState<ToolSubTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool') as ToolSubTab | null;
      if (toolParam && ['image-extractor', 'contrast-checker', 'color-blindness', 'brand-colors', 'gradient-studio'].includes(toolParam)) {
        return toolParam;
      }
    } catch {
      // fallback
    }
    return 'image-extractor';
  });

  // Dynamic SEO & URL Sync Effect
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      let dynamicTitle = 'PaletteLab — Free Color Palette Generator & Design Tools';
      let dynamicDescription = 'Discover 3,900+ original color palettes, extract colors from photos, explore HEX codes, and generate harmonic design schemes instantly. 100% original.';

      if (activeTab === 'palette-detail' && selectedPalette) {
        params.set('tab', 'palette-detail');
        params.set('palette', selectedPalette.slug);
        dynamicTitle = `${selectedPalette.name} Color Palette (${selectedPalette.colors.join(', ')}) - PaletteLab`;
        dynamicDescription = `Explore the ${selectedPalette.name} color scheme by ${selectedPalette.creator.name}. Includes ${selectedPalette.colors.length} hex codes, CSS variables, and Tailwind config.`;
      } else if (activeTab === 'color-detail') {
        params.set('tab', 'color-detail');
        params.set('hex', selectedHex.replace('#', ''));
        dynamicTitle = `Color ${selectedHex.toUpperCase()} - Hex Codes, RGB, HSL, Harmonies & Meaning - PaletteLab`;
        dynamicDescription = `Detailed color breakdown for ${selectedHex.toUpperCase()}: RGB, HSL, CMYK values, color blindness simulation, and WCAG accessibility contrast ratios.`;
      } else if (activeTab === 'tools') {
        params.set('tab', 'tools');
        params.set('tool', toolSubTab);
        const toolNames: Record<ToolSubTab, string> = {
          'image-extractor': 'Photo Color Palette Extractor',
          'contrast-checker': 'WCAG Color Contrast Checker Matrix',
          'color-blindness': 'Color Blindness Simulator & Daltonization Audit',
          'brand-colors': 'Famous Tech & Brand Design Tokens',
          'gradient-maker': 'CSS Linear & Radial Gradient Generator',
          'ui-preview': 'Live UI Dashboard & Mobile Mockup Previewer',
          'ai-studio': 'Semantic Color Palette Studio',
          'shades-tints': 'Tints, Shades & Monochromatic Scale Generator',
        };
        dynamicTitle = `${toolNames[toolSubTab] || 'Design Tools'} - Free Online Suite | PaletteLab`;
        dynamicDescription = `Professional designer tools: ${toolNames[toolSubTab]}, WCAG contrast testing, color blindness simulation, and CSS generator.`;
      } else if (activeTab === 'generator') {
        params.set('tab', 'generator');
        dynamicTitle = 'Spacebar Harmonic Palette Generator - PaletteLab';
        dynamicDescription = 'Press spacebar to generate infinite color harmonies with locked color slots, lightness controls, and instant code export.';
      } else if (activeTab === 'collections') {
        params.set('tab', 'collections');
        dynamicTitle = 'Your Saved Color Palettes & Favorites - PaletteLab';
      } else {
        if (filters.searchQuery) {
          params.set('q', filters.searchQuery);
          dynamicTitle = `"${filters.searchQuery}" Color Palettes & Schemes - PaletteLab`;
        }
        if (filters.category && filters.category !== 'all') {
          params.set('category', filters.category);
          dynamicTitle = `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Color Palettes & Schemes - PaletteLab`;
        }
      }

      // Update document title and meta description
      document.title = dynamicTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', dynamicDescription);
      }

      // Update URL without triggering page reload
      const newQuery = params.toString();
      const newUrl = newQuery ? `?${newQuery}` : window.location.pathname;
      if (window.location.search !== `?${newQuery}`) {
        window.history.replaceState({ tab: activeTab, hex: selectedHex }, '', newUrl);
      }
    } catch {
      // Safe fallback
    }
  }, [activeTab, selectedPalette, selectedHex, toolSubTab, filters.searchQuery, filters.category]);

  const [likedPaletteIds, setLikedPaletteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('palettelab_likes') || '[]');
    } catch {
      return [];
    }
  });

  const [savedPaletteIds, setSavedPaletteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('palettelab_saves') || '[]');
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Generator slots
  const [generatorSlots, setGeneratorSlots] = useState<GeneratorSlot[]>([
    { id: '1', hex: '#264653', isLocked: false },
    { id: '2', hex: '#2A9D8F', isLocked: false },
    { id: '3', hex: '#E9C46A', isLocked: false },
    { id: '4', hex: '#F4A261', isLocked: false },
    { id: '5', hex: '#E76F51', isLocked: false },
  ]);

  // Sync likes and saves
  useEffect(() => {
    localStorage.setItem('palettelab_likes', JSON.stringify(likedPaletteIds));
  }, [likedPaletteIds]);

  useEffect(() => {
    localStorage.setItem('palettelab_saves', JSON.stringify(savedPaletteIds));
  }, [savedPaletteIds]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev.slice(-3), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const copyValue = useCallback(async (value: string, label: string = 'Copied to clipboard', hexPreview?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast({
        type: 'copy',
        title: label,
        message: value.length > 30 ? `${value.substring(0, 30)}...` : value,
        hexPreview,
      });
    } catch {
      showToast({
        type: 'info',
        title: 'Copied!',
        message: value,
        hexPreview,
      });
    }
  }, [showToast]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const openPalette = useCallback((paletteOrSlug: Palette | string) => {
    if (typeof paletteOrSlug === 'string') {
      const clean = paletteOrSlug.toLowerCase().trim();
      const found = palettes.find((p) => p.slug === clean || p.id === clean);
      if (found) {
        setSelectedPalette(found);
        setActiveTab('palette-detail');
      }
    } else {
      setSelectedPalette(paletteOrSlug);
      setActiveTab('palette-detail');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [palettes]);

  const closePalette = useCallback(() => {
    setSelectedPalette(null);
    setActiveTab('discover');
  }, []);

  const openColorDetail = useCallback((hex: string) => {
    setSelectedHex(normalizeHex(hex));
    setActiveTab('color-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleLike = useCallback((paletteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = likedPaletteIds.includes(paletteId);
    
    if (!isLiked) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C'],
        disableForReducedMotion: true,
      });
      setLikedPaletteIds((prev) => [...prev, paletteId]);
      setPalettes((prev) =>
        prev.map((p) => {
          if (p.id === paletteId) {
            const newLikes = p.likes + 1;
            try {
              const currentMap = JSON.parse(localStorage.getItem('palettelab_likes_map') || '{}');
              currentMap[paletteId] = newLikes;
              localStorage.setItem('palettelab_likes_map', JSON.stringify(currentMap));
            } catch {}
            return { ...p, likes: newLikes };
          }
          return p;
        })
      );
      showToast({ type: 'success', title: 'Added to Liked Palettes' });
    } else {
      setLikedPaletteIds((prev) => prev.filter((id) => id !== paletteId));
      setPalettes((prev) =>
        prev.map((p) => {
          if (p.id === paletteId) {
            const newLikes = Math.max(0, p.likes - 1);
            try {
              const currentMap = JSON.parse(localStorage.getItem('palettelab_likes_map') || '{}');
              currentMap[paletteId] = newLikes;
              localStorage.setItem('palettelab_likes_map', JSON.stringify(currentMap));
            } catch {}
            return { ...p, likes: newLikes };
          }
          return p;
        })
      );
    }
  }, [likedPaletteIds, showToast]);

  const toggleSave = useCallback((paletteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = savedPaletteIds.includes(paletteId);
    if (!isSaved) {
      setSavedPaletteIds((prev) => [...prev, paletteId]);
      setPalettes((prev) =>
        prev.map((p) => (p.id === paletteId ? { ...p, saves: p.saves + 1 } : p))
      );
      showToast({ type: 'success', title: 'Saved to your collection' });
    } else {
      setSavedPaletteIds((prev) => prev.filter((id) => id !== paletteId));
      setPalettes((prev) =>
        prev.map((p) => (p.id === paletteId ? { ...p, saves: Math.max(0, p.saves - 1) } : p))
      );
      showToast({ type: 'info', title: 'Removed from your collection' });
    }
  }, [savedPaletteIds, showToast]);

  // Generator functions
  const generateRandomPalette = useCallback(() => {
    const lockedSlots = generatorSlots.filter((s) => s.isLocked);
    const baseColor = lockedSlots.length > 0 ? lockedSlots[0].hex : undefined;
    const newColors = generateHarmonicPalette(baseColor, generatorSlots.length);

    setGeneratorSlots((prev) =>
      prev.map((slot, i) => {
        if (slot.isLocked) return slot;
        return {
          ...slot,
          hex: newColors[i] || normalizeHex(Math.floor(Math.random() * 16777215).toString(16)),
        };
      })
    );
  }, [generatorSlots]);

  const toggleSlotLock = useCallback((index: number) => {
    setGeneratorSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, isLocked: !slot.isLocked } : slot))
    );
  }, []);

  const setSlotColor = useCallback((index: number, hex: string) => {
    const trimmed = hex.trim();
    setGeneratorSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        if (/^#[0-9A-Fa-f]{0,6}$/.test(trimmed)) {
          return { ...slot, hex: trimmed.toUpperCase() };
        }
        return { ...slot, hex: normalizeHex(trimmed) };
      })
    );
  }, []);

  const addSlot = useCallback(() => {
    if (generatorSlots.length >= 6) return;
    const newHarmonics = generateHarmonicPalette(generatorSlots[0]?.hex, generatorSlots.length + 1);
    const newColor = newHarmonics[newHarmonics.length - 1];
    setGeneratorSlots((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 7), hex: newColor, isLocked: false },
    ]);
  }, [generatorSlots]);

  const removeSlot = useCallback((index: number) => {
    if (generatorSlots.length <= 3) return;
    setGeneratorSlots((prev) => prev.filter((_, i) => i !== index));
  }, [generatorSlots.length]);

  const setGeneratorPaletteFromColors = useCallback((colors: string[]) => {
    const slots = colors.slice(0, 6).map((hex, i) => ({
      id: `${i + 1}-${Date.now()}`,
      hex: normalizeHex(hex),
      isLocked: false,
    }));
    setGeneratorSlots(slots);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const saveNewPalette = useCallback(
    (name: string, colors: string[], category: string = 'Trending', tags: string[] = []): Palette => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newPalette: Palette = {
        id: `custom-${Date.now()}`,
        slug: `${slug}-${Math.floor(Math.random() * 900 + 100)}`,
        name: name.trim() || 'Custom Palette',
        colors: colors.map((c) => normalizeHex(c)),
        creator: { id: 'u-me', name: 'You', verified: true },
        likes: 1,
        views: 1,
        copies: 0,
        saves: 1,
        category,
        tags: tags.length ? tags : ['custom', 'creation'],
        createdAt: new Date().toISOString().split('T')[0],
      };

      setPalettes((prev) => {
        const updated = [newPalette, ...prev];
        const userCustoms = updated.filter((p) => p.id.startsWith('custom-'));
        localStorage.setItem('palettelab_custom_palettes', JSON.stringify(userCustoms));
        return updated;
      });

      setSavedPaletteIds((prev) => [...prev, newPalette.id]);
      setLikedPaletteIds((prev) => [...prev, newPalette.id]);
      showToast({ type: 'success', title: 'Palette Published & Saved!' });
      return newPalette;
    },
    [showToast]
  );

  // Filtered palettes calculation
  const filteredPalettes = palettes.filter((palette) => {
    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = palette.name.toLowerCase().includes(q);
      const matchCategory = palette.category.toLowerCase().includes(q);
      const matchTags = palette.tags.some((t) => t.toLowerCase().includes(q));
      const matchHex = palette.colors.some((c) => c.toLowerCase().includes(q.replace('#', '')));
      const matchCreator = palette.creator.name.toLowerCase().includes(q);

      if (!matchName && !matchCategory && !matchTags && !matchHex && !matchCreator) {
        return false;
      }
    }

    // 2. Category Filter
    if (filters.category && filters.category !== 'all') {
      const catLower = filters.category.toLowerCase();
      if (catLower === 'trending') {
        if (!palette.isFeatured && palette.likes < 800) return false;
      } else if (catLower === 'popular') {
        if (palette.likes < 700) return false;
      } else if (catLower === 'new') {
        // Recent
      } else if (catLower === 'random') {
        // Random
      } else {
        const matchCategory = palette.category.toLowerCase() === catLower;
        const matchTags = palette.tags.some((t) => t.toLowerCase() === catLower);
        if (!matchCategory && !matchTags) return false;
      }
    }

    // 3. Color Tone Filter
    if (filters.colorTone && filters.colorTone !== 'all') {
      const hasTone = palette.colors.some((hex) => {
        const tone = detectColorTone(hex);
        return tone === filters.colorTone;
      });
      if (!hasTone) return false;
    }

    // 4. Color Count
    if (filters.colorCount !== 'all') {
      if (palette.colors.length !== filters.colorCount) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'likes') return b.likes - a.likes;
    if (filters.sortBy === 'views') return b.views - a.views;
    if (filters.sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filters.sortBy === 'random') return Math.sin(a.likes) - Math.sin(b.likes);
    return (b.likes * 2 + b.views * 0.1) - (a.likes * 2 + a.views * 0.1);
  });

  return (
    <PaletteContext.Provider
      value={{
        palettes,
        filteredPalettes,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeTab,
        setActiveTab,
        selectedPalette,
        openPalette,
        closePalette,
        selectedHex,
        openColorDetail,
        toolSubTab,
        setToolSubTab,
        likedPaletteIds,
        savedPaletteIds,
        toggleLike,
        toggleSave,
        toasts,
        showToast,
        removeToast,
        copyValue,
        generatorSlots,
        generateRandomPalette,
        toggleSlotLock,
        setSlotColor,
        addSlot,
        removeSlot,
        setGeneratorPaletteFromColors,
        saveNewPalette,
      }}
    >
      {children}
    </PaletteContext.Provider>
  );
};

export const usePalette = () => {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
};
