import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePalette } from '../context/PaletteContext';
import { BRAND_PALETTES, BrandPalette } from '../data/brandColorsData';
import { CATEGORIES } from '../data/seedPalettes';
import { normalizeHex, getColorDetails } from '../utils/colorUtils';
import {
  Search,
  X,
  Sparkles,
  Layers,
  Wrench,
  Eye,
  CheckCircle,
  Image as ImageIcon,
  Palette as PaletteIcon,
  ArrowRight,
  TrendingUp,
  Heart,
  Sliders,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { Palette } from '../types';

interface IntelligentSearchBarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const POPULAR_THEMES = [
  { label: '🌸 Pastel Dream', query: 'pastel' },
  { label: '⚡ Cyberpunk Neon', query: 'neon' },
  { label: '🌅 Warm Sunset', query: 'sunset' },
  { label: '🌙 Dark Mode UI', query: 'dark' },
  { label: '🌊 Ocean & Mint', query: 'ocean' },
  { label: '🌿 Earth Botanical', query: 'earth' },
  { label: '👑 Gold Luxury', query: 'gold' },
  { label: '🍂 Vintage Retro', query: 'retro' },
  { label: '💎 Minimalist', query: 'minimal' },
];

const QUICK_TOOLS = [
  {
    id: 'generator',
    title: 'Harmonic Palette Generator',
    desc: 'Spacebar randomized harmonic schemes',
    icon: Sparkles,
    tab: 'generator' as const,
    color: 'text-amber-500 bg-amber-50',
  },
  {
    id: 'image-extractor',
    title: 'Photo to Palette Extractor',
    desc: 'Extract color swatches with eyedropper loupe',
    icon: ImageIcon,
    tab: 'tools' as const,
    toolSubTab: 'image-extractor' as const,
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    id: 'color-detail',
    title: 'Color-Hex Encyclopedia',
    desc: 'Technical color metrics, tints & harmonies',
    icon: Layers,
    tab: 'color-detail' as const,
    color: 'text-cyan-600 bg-cyan-50',
  },
  {
    id: 'brand-colors',
    title: 'Brand Color Tokens',
    desc: '100+ iconic tech & design system palettes',
    icon: Layers,
    tab: 'tools' as const,
    toolSubTab: 'brand-colors' as const,
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    id: 'contrast-checker',
    title: 'WCAG Contrast Checker',
    desc: 'Test AA / AAA text contrast ratios',
    icon: CheckCircle,
    tab: 'tools' as const,
    toolSubTab: 'contrast-checker' as const,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: 'color-blindness',
    title: 'Color Blindness Simulator',
    desc: 'Simulate 8 visual deficiency conditions',
    icon: Eye,
    tab: 'tools' as const,
    toolSubTab: 'color-blindness' as const,
    color: 'text-purple-600 bg-purple-50',
  },
];

export const IntelligentSearchBar: React.FC<IntelligentSearchBarProps> = ({
  isMobile = false,
  onCloseMobile,
}) => {
  const {
    filters,
    updateFilter,
    palettes,
    openPalette,
    openColorDetail,
    setActiveTab,
    setToolSubTab,
    closePalette,
  } = usePalette();

  const [searchVal, setSearchVal] = useState(filters.searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize local input when global filter changes (e.g. from hero chips)
  useEffect(() => {
    setSearchVal(filters.searchQuery);
  }, [filters.searchQuery]);

  // Global shortcut '/' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen]);

  // Click outside listener to dismiss suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if input is a recognized Hex code or CSS Color format
  const detectedColor = useMemo(() => {
    const clean = searchVal.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{3}$/.test(clean) || /^[0-9A-Fa-f]{6}$/.test(clean)) {
      try {
        const hex = normalizeHex(searchVal);
        const details = getColorDetails(hex);
        return { hex, details };
      } catch {
        return null;
      }
    }
    return null;
  }, [searchVal]);

  // Matching Brands
  const matchedBrands = useMemo(() => {
    if (!searchVal.trim()) return [];
    const q = searchVal.toLowerCase().trim();
    return BRAND_PALETTES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q)
    ).slice(0, 3);
  }, [searchVal]);

  // Matching Palettes (Top 4 previews)
  const matchedPalettes = useMemo(() => {
    if (!searchVal.trim()) return [];
    const q = searchVal.toLowerCase().trim();
    const qNoHash = q.replace('#', '');
    return palettes
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.colors.some((c) => c.toLowerCase().includes(qNoHash))
      )
      .slice(0, 4);
  }, [searchVal, palettes]);

  // Matched Categories & Themes
  const matchedThemes = useMemo(() => {
    const q = searchVal.toLowerCase().trim();
    if (!q) return POPULAR_THEMES.slice(0, 6);
    return POPULAR_THEMES.filter(
      (t) => t.label.toLowerCase().includes(q) || t.query.toLowerCase().includes(q)
    );
  }, [searchVal]);

  // Handlers
  const handleInputChange = (val: string) => {
    setSearchVal(val);
    updateFilter('searchQuery', val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    setSearchVal('');
    updateFilter('searchQuery', '');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    updateFilter('searchQuery', searchVal);
    if (onCloseMobile) onCloseMobile();
    closePalette();
    setActiveTab('discover');

    const grid = document.getElementById('palette-discovery-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTheme = (query: string) => {
    setSearchVal(query);
    updateFilter('searchQuery', query);
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    closePalette();
    setActiveTab('discover');

    const grid = document.getElementById('palette-discovery-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPalette = (palette: Palette) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    openPalette(palette);
  };

  const handleSelectBrand = (brand: BrandPalette) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    closePalette();
    setToolSubTab('brand-colors');
    setActiveTab('tools');
  };

  const handleSelectTool = (tool: (typeof QUICK_TOOLS)[0]) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    closePalette();
    if (tool.toolSubTab) {
      setToolSubTab(tool.toolSubTab);
    }
    setActiveTab(tool.tab);
  };

  const handleExploreHex = (hex: string) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    openColorDetail(hex);
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? 'w-full' : 'w-full min-w-[280px] max-w-xl'}`}>
      {/* Background backdrop blur when open on desktop for Spotlight feel */}
      {isOpen && !isMobile && (
        <div
          className="fixed inset-0 bg-neutral-950/25 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative w-full group z-50">
        <div className="relative flex items-center">
          <button
            type="submit"
            aria-label="Search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            id={isMobile ? 'mobile-search-input' : 'header-search-input'}
            type="text"
            placeholder={
              isMobile
                ? 'Search colors, moods, hex...'
                : 'Search 7,900+ palettes by color (#3B82F6, teal), mood (sunset, neon)...'
            }
            value={searchVal}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`w-full pl-10 pr-20 py-2.5 rounded-2xl text-sm font-medium text-neutral-900 bg-neutral-100/90 border border-neutral-200/90 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-neutral-400 placeholder:font-normal shadow-2xs hover:bg-neutral-100 ${
              isOpen ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10 shadow-md' : ''
            }`}
          />

          {/* Right Action Icons & Badges */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchVal ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search text"
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-200/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              !isMobile && (
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-200/70 border border-neutral-300/60 rounded-md select-none">
                  ⌘K
                </kbd>
              )
            )}

            {isMobile && (
              <button
                type="submit"
                className="px-3 py-1 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Go
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* Intelligent Autocomplete & Suggestions Dropdown Panel                     */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white rounded-3xl border border-neutral-200/95 shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150 max-h-[80vh] flex flex-col ${
            isMobile
              ? 'left-0 right-0 w-full'
              : 'left-1/2 -translate-x-1/2 w-[560px] sm:w-[600px] md:w-[640px] max-w-[92vw]'
          }`}
        >
          
          <div className="overflow-y-auto divide-y divide-neutral-100 p-2 space-y-3">
            
            {/* 1. Real-time Live Color & HEX Analyzer Card */}
            {detectedColor && (
              <div className="p-3 bg-gradient-to-br from-neutral-50 to-indigo-50/40 rounded-xl border border-indigo-100/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Detected Color & Metrics
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-800">
                    {detectedColor.hex}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: detectedColor.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {detectedColor.details.name}
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono">
                      RGB({detectedColor.details.rgb.r}, {detectedColor.details.rgb.g},{' '}
                      {detectedColor.details.rgb.b}) • HSL({detectedColor.details.hsl.h}°,{' '}
                      {detectedColor.details.hsl.s}%, {detectedColor.details.hsl.l}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExploreHex(detectedColor.hex)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Open in Color Encyclopedia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme(detectedColor.hex)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors"
                  >
                    Filter Palettes
                  </button>
                </div>
              </div>
            )}

            {/* 2. Top Matching Palettes Preview */}
            {matchedPalettes.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="px-2 flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <span>Matching Palettes ({matchedPalettes.length})</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Click to open</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {matchedPalettes.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPalette(p)}
                      className="p-2 rounded-xl hover:bg-neutral-100/80 text-left transition-colors flex items-center justify-between gap-2 group border border-transparent hover:border-neutral-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors truncate">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {p.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-md shadow-2xs inline-block"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400 shrink-0">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>{p.likes}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Matching Brand Palettes */}
            {matchedBrands.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <div className="px-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Official Brand Tokens
                </div>
                <div className="space-y-1">
                  {matchedBrands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBrand(b)}
                      className="w-full p-2 rounded-xl hover:bg-neutral-100/80 text-left transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors">
                            {b.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">{b.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {b.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-md shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Smart Themes & Moods Chips */}
            {matchedThemes.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="px-2 flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{searchVal.trim() ? 'Suggested Tags & Moods' : 'Trending Themes'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {matchedThemes.map((theme) => (
                    <button
                      key={theme.query}
                      type="button"
                      onClick={() => handleSelectTheme(theme.query)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-indigo-50 hover:text-indigo-700 text-neutral-700 text-xs font-semibold transition-all hover:scale-102 flex items-center gap-1"
                    >
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Quick Tools Navigation */}
            <div className="pt-2 space-y-1.5">
              <div className="px-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Quick Design Tools
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {QUICK_TOOLS.slice(0, searchVal.trim() ? 4 : 6).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleSelectTool(tool)}
                      className="p-2 rounded-xl hover:bg-neutral-100/80 text-left transition-colors flex items-center gap-2.5 group"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-800 group-hover:text-indigo-600 transition-colors truncate">
                          {tool.title}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">{tool.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Dropdown Footer Action */}
          <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-neutral-300 font-mono text-[10px] text-neutral-700 font-bold">
                Enter ↵
              </kbd>
              <span>to search all 7,900+ palettes</span>
            </span>

            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>View full feed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
