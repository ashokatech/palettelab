import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { CATEGORIES } from '../data/seedPalettes';
import { ColorTone, SortOption, PaletteViewMode } from '../types';
import { Filter, Sparkles, SlidersHorizontal, RotateCcw, LayoutGrid, Monitor, AlignJustify } from 'lucide-react';

const COLOR_SWATCHES: { tone: ColorTone; label: string; bgClass: string; hex: string }[] = [
  { tone: 'all', label: 'All Colors', bgClass: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500', hex: '' },
  { tone: 'red', label: 'Red', bgClass: 'bg-red-500', hex: '#EF4444' },
  { tone: 'orange', label: 'Orange', bgClass: 'bg-orange-500', hex: '#F97316' },
  { tone: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-400', hex: '#EAB308' },
  { tone: 'green', label: 'Green', bgClass: 'bg-emerald-500', hex: '#10B981' },
  { tone: 'teal', label: 'Teal', bgClass: 'bg-teal-500', hex: '#14B8A6' },
  { tone: 'blue', label: 'Blue', bgClass: 'bg-blue-500', hex: '#3B82F6' },
  { tone: 'purple', label: 'Purple', bgClass: 'bg-purple-500', hex: '#A855F7' },
  { tone: 'pink', label: 'Pink', bgClass: 'bg-pink-500', hex: '#EC4899' },
  { tone: 'neutral', label: 'Neutral', bgClass: 'bg-stone-500', hex: '#78716C' },
  { tone: 'dark', label: 'Dark', bgClass: 'bg-neutral-900', hex: '#171717' },
  { tone: 'light', label: 'Light', bgClass: 'bg-neutral-200 border border-neutral-300', hex: '#E5E5E5' },
];

interface DiscoveryFiltersProps {
  viewMode: PaletteViewMode;
  setViewMode: (mode: PaletteViewMode) => void;
}

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({ viewMode, setViewMode }) => {
  const { filters, updateFilter, resetFilters, filteredPalettes, palettes } = usePalette();

  const isFiltered =
    filters.category !== 'all' ||
    filters.colorTone !== 'all' ||
    filters.colorCount !== 'all' ||
    filters.sortBy !== 'popularity' ||
    filters.searchQuery !== '';

  return (
    <div id="discovery-filters-container" className="space-y-4 mb-8">
      
      {/* Category Navigation Pills (Horizontal scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mask-gradient">
        {CATEGORIES.map((cat) => {
          const isActive = filters.category.toLowerCase() === cat.key.toLowerCase();
          return (
            <button
              key={cat.key}
              id={`filter-category-${cat.key}`}
              onClick={() => updateFilter('category', cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100/90 text-neutral-600 hover:bg-neutral-200/90 hover:text-neutral-900'
              }`}
            >
              {cat.key === 'trending' && <Sparkles className="w-3 h-3 text-amber-400" />}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Color Swatches + View Mode + Color Count + Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-neutral-100">
        
        {/* Color Tone Circle Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-medium text-neutral-400 hidden sm:inline-block">Color:</span>
          <div className="flex items-center gap-1.5">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected = filters.colorTone === swatch.tone;
              return (
                <button
                  key={swatch.tone}
                  id={`swatch-filter-${swatch.tone}`}
                  onClick={() => updateFilter('colorTone', swatch.tone)}
                  title={swatch.label}
                  className={`w-6 h-6 rounded-full transition-all relative shrink-0 ${swatch.bgClass} ${
                    isSelected
                      ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  aria-label={swatch.label}
                />
              );
            })}
          </div>
        </div>

        {/* Right Sort & Count Controls */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium text-neutral-600">
            <button
              onClick={() => setViewMode('grid')}
              title="Standard Card Grid View"
              className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('mockup')}
              title="Live UI Component Mockup View"
              className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'mockup'
                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                  : 'hover:text-neutral-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">UI Mockup</span>
            </button>
          </div>

          {/* Number of Colors Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium text-neutral-600">
            {(['all', 4, 5, 6] as const).map((cnt) => (
              <button
                key={cnt}
                onClick={() => updateFilter('colorCount', cnt)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filters.colorCount === cnt
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'hover:text-neutral-900'
                }`}
              >
                {cnt === 'all' ? 'Any' : `${cnt} Shades`}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <select
            id="sort-by-select"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 border-none text-neutral-700 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
          >
            <option value="popularity">Popularity</option>
            <option value="likes">Most Liked</option>
            <option value="views">Most Viewed</option>
            <option value="date">Newest</option>
            <option value="random">Surprise</option>
          </select>

          {/* Reset Filter Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Result stats summary */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pt-1">
        <span>
          Showing <strong className="text-neutral-900 font-semibold">{filteredPalettes.length}</strong> of{' '}
          {palettes.length} palettes
        </span>

        {filters.searchQuery && (
          <span>
            Search results for "<span className="font-semibold text-neutral-800">{filters.searchQuery}</span>"
          </span>
        )}
      </div>

    </div>
  );
};
