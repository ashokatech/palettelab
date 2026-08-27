import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { 
  Palette as PaletteIcon, 
  Sparkles, 
  Wrench, 
  Bookmark, 
  Search, 
  Plus, 
  Menu, 
  X, 
  Heart,
  Layers,
  ArrowUpRight,
  Image as ImageIcon
} from 'lucide-react';

interface HeaderProps {
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreate }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setToolSubTab,
    filters, 
    updateFilter, 
    closePalette, 
    likedPaletteIds, 
    savedPaletteIds 
  } = usePalette();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleNavClick = (tab: any, toolTab?: any) => {
    closePalette();
    if (toolTab) {
      setToolSubTab(toolTab);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('discover')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-lg grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden">
                <span className="bg-amber-400"></span>
                <span className="bg-rose-500"></span>
                <span className="bg-teal-400"></span>
                <span className="bg-indigo-600"></span>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-1 font-sans">
                Palette<span className="text-indigo-600">Lab</span>
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-neutral-600">
            <button
              id="nav-discover"
              onClick={() => handleNavClick('discover')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <PaletteIcon className="w-4 h-4 text-indigo-500" />
              Discover
            </button>

            <button
              id="nav-generate"
              onClick={() => handleNavClick('generator')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Generator
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 ml-1">
                Space
              </span>
            </button>

            <button
              id="nav-photo-extractor"
              onClick={() => handleNavClick('tools', 'image-extractor')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Photo Extractor
            </button>

            <button
              id="nav-color-hex"
              onClick={() => handleNavClick('color-detail')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'color-detail'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-600" />
              Color-Hex
            </button>

            <button
              id="nav-tools"
              onClick={() => handleNavClick('tools')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Wrench className="w-4 h-4 text-purple-500" />
              Tools
            </button>

            <button
              id="nav-collections"
              onClick={() => handleNavClick('collections')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'collections'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-rose-500" />
              Saved
              {(savedPaletteIds.length > 0 || likedPaletteIds.length > 0) && (
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 ml-0.5">
                  {savedPaletteIds.length + likedPaletteIds.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="header-search-input"
              type="text"
              placeholder="Search by color (blue, #F4A261), mood (sunset, luxury)..."
              value={filters.searchQuery}
              onChange={(e) => {
                updateFilter('searchQuery', e.target.value);
                if (activeTab !== 'discover') {
                  closePalette();
                  setActiveTab('discover');
                }
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-neutral-100/80 border border-neutral-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-neutral-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Toggle */}
          <button
            id="mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Create Palette Button */}
          <button
            id="header-create-palette-btn"
            onClick={onOpenCreate}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Palette</span>
          </button>

          {/* Live Palette Count Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>7,900+ Original Palettes</span>
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-neutral-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search colors, tags, hex..."
              value={filters.searchQuery}
              onChange={(e) => {
                updateFilter('searchQuery', e.target.value);
                if (activeTab !== 'discover') {
                  closePalette();
                  setActiveTab('discover');
                }
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-neutral-100 border border-neutral-200 outline-none focus:bg-white focus:border-indigo-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-2 shadow-xl">
          <button
            onClick={() => handleNavClick('discover')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'discover' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <PaletteIcon className="w-5 h-5 text-indigo-500" />
              Discover Palettes
            </span>
          </button>

          <button
            onClick={() => handleNavClick('tools', 'image-extractor')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'tools' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              Photo to Palette Extractor
            </span>
          </button>

          <button
            onClick={() => handleNavClick('generator')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'generator' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Palette Generator (Spacebar)
            </span>
          </button>

          <button
            onClick={() => handleNavClick('color-detail')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'color-detail' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              Color-Hex Encyclopedia
            </span>
          </button>

          <button
            onClick={() => handleNavClick('tools')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'tools' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-500" />
              Design Tools (WCAG, Gradients, Mockups)
            </span>
          </button>

          <button
            onClick={() => handleNavClick('collections')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-medium ${
              activeTab === 'collections' ? 'bg-indigo-50 text-indigo-700' : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-rose-500" />
              Saved & Liked
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {savedPaletteIds.length + likedPaletteIds.length}
            </span>
          </button>

          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreate();
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Palette
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
