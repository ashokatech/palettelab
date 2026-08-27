import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { BRAND_PALETTES, BrandPalette } from '../data/brandColorsData';
import { 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Code2, 
  Layers, 
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { getColorDetails, formatTailwindConfig, formatCssVariables } from '../utils/colorUtils';

const CATEGORIES = [
  'All',
  'Developer Tools',
  'Productivity',
  'Creative & Design',
  'Entertainment & Social',
  'Fintech & Commerce',
] as const;

export const BrandColorsView: React.FC = () => {
  const { copyValue, showToast, setGeneratorPaletteFromColors, saveNewPalette } = usePalette();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredBrands = BRAND_PALETTES.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      brand.colors.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.hex.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || brand.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopySingleColor = (hex: string, role: string, brandName: string, id: string) => {
    copyValue(hex, `Copied ${brandName} ${role} (${hex})`, hex);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const handleCopyTailwind = (brand: BrandPalette) => {
    const colors = brand.colors.map((c) => c.hex);
    const twConfig = formatTailwindConfig(colors, brand.name);
    copyValue(twConfig, `Copied ${brand.name} Tailwind Config`);
  };

  const handleCopyCssVars = (brand: BrandPalette) => {
    const colors = brand.colors.map((c) => c.hex);
    const css = formatCssVariables(colors, brand.name);
    copyValue(css, `Copied ${brand.name} CSS Variables (:root)`);
  };

  const handleCopyJsonTokens = (brand: BrandPalette) => {
    const tokens = {
      brand: brand.name,
      website: brand.website,
      tokens: brand.colors.reduce((acc, c) => {
        const key = c.role.toLowerCase().replace(/[^a-z0-9]/g, '-');
        acc[key] = { value: c.hex, name: c.name };
        return acc;
      }, {} as Record<string, { value: string; name: string }>),
    };
    copyValue(JSON.stringify(tokens, null, 2), `Copied ${brand.name} JSON Design Tokens`);
  };

  return (
    <div id="brand-colors-directory" className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated Brand & Tech Design Tokens</span>
          </div>

          <span className="text-xs text-neutral-400 font-mono">
            {BRAND_PALETTES.length} Iconic Digital Brands
          </span>
        </div>

        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Tech & Digital Brand Palettes
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Exact hex codes, UI semantic roles, and copyable design tokens for the world's most renowned tech interfaces.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand name (e.g. Stripe, Linear, Spotify, OpenAI)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-neutral-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Brand Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBrands.map((brand) => {
            const hexes = brand.colors.map((c) => c.hex);
            const primaryColor = brand.colors[0]?.hex || '#000000';
            const primaryDetails = getColorDetails(primaryColor);

            return (
              <div
                key={brand.id}
                id={`brand-card-${brand.id}`}
                className="bg-white rounded-3xl border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-5"
              >
                {/* Header & Meta */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs font-mono"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryDetails.isDark ? '#FFFFFF' : '#000000',
                        }}
                      >
                        {brand.name.slice(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                          <span>{brand.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                            {brand.category}
                          </span>
                        </h3>
                        <a
                          href={`https://${brand.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-neutral-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <span>{brand.website}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Open in Studio Action */}
                    <button
                      onClick={() => setGeneratorPaletteFromColors(hexes)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Open and edit in Spacebar Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline">Studio</span>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {brand.description}
                  </p>
                </div>

                {/* Big 5-Color Strip */}
                <div className="h-16 rounded-2xl overflow-hidden flex border border-neutral-200/80 shadow-inner">
                  {brand.colors.map((c, idx) => {
                    const tokenKey = `${brand.id}-${idx}`;
                    const isCopied = copiedToken === tokenKey;
                    const cInfo = getColorDetails(c.hex);

                    return (
                      <div
                        key={idx}
                        style={{ backgroundColor: c.hex }}
                        onClick={() => handleCopySingleColor(c.hex, c.role, brand.name, tokenKey)}
                        className="flex-1 h-full relative group/strip flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.5]"
                        title={`Click to copy ${c.role}: ${c.hex}`}
                      >
                        <div
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-center truncate shadow-2xs opacity-0 group-hover/strip:opacity-100 transition-opacity ${
                            cInfo.isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-neutral-900'
                          }`}
                        >
                          {isCopied ? 'COPIED!' : c.hex}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Individual Role Token List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Design Tokens & Semantic Roles
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {brand.colors.map((c, idx) => {
                      const tokenKey = `${brand.id}-token-${idx}`;
                      const isCopied = copiedToken === tokenKey;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCopySingleColor(c.hex, c.role, brand.name, tokenKey)}
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/60 text-left transition-colors group/item"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-4 h-4 rounded-md shrink-0 border border-black/10 shadow-2xs"
                              style={{ backgroundColor: c.hex }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-neutral-800 truncate">
                                {c.role}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {c.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 pl-2">
                            <span className="text-[11px] font-mono font-bold text-neutral-600">
                              {c.hex}
                            </span>
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-400 group-hover/item:text-neutral-700 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Quick Export Actions */}
                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleCopyTailwind(brand)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors flex items-center gap-1"
                      title="Copy Tailwind CSS Theme Config"
                    >
                      <Code2 className="w-3 h-3 text-neutral-500" />
                      <span>Tailwind</span>
                    </button>

                    <button
                      onClick={() => handleCopyCssVars(brand)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors flex items-center gap-1"
                      title="Copy CSS :root Variables"
                    >
                      <Code2 className="w-3 h-3 text-neutral-500" />
                      <span>CSS Vars</span>
                    </button>

                    <button
                      onClick={() => handleCopyJsonTokens(brand)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors flex items-center gap-1"
                      title="Copy JSON Design Tokens"
                    >
                      <Layers className="w-3 h-3 text-neutral-500" />
                      <span>JSON Tokens</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      saveNewPalette(`${brand.name} Brand Tokens`, hexes, 'Tech Brand', brand.tags);
                      showToast({ type: 'success', title: `Saved ${brand.name} to Library!` });
                    }}
                    className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-2xs transition-colors"
                  >
                    Save to Library
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 space-y-3">
          <p className="text-sm font-semibold text-neutral-700">No brands found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
