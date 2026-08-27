import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { IntelligentSearchBar } from './IntelligentSearchBar';
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
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Core Nav */}
        <div className="flex items-center gap-4 shrink-0">
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
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-neutral-600">
            <button
              id="nav-discover"
              onClick={() => handleNavClick('discover')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <PaletteIcon className="w-4 h-4 text-indigo-500" />
              <span>Discover</span>
            </button>

            <button
              id="nav-generate"
              onClick={() => handleNavClick('generator')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Generator</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 ml-0.5">
                Space
              </span>
            </button>

            <div className="relative group">
              <button
                id="nav-tools"
                onClick={() => handleNavClick('tools')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tools'
                    ? 'text-neutral-900 bg-neutral-100 font-semibold'
                    : 'hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Wrench className="w-4 h-4 text-purple-500" />
                <span>Tools</span>
                <span className="text-[10px] leading-none">▼</span>
              </button>
              {/* Hover mega-menu — makes 7 tools discoverable without extra click */}
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 w-64 grid grid-cols-1 gap-1">
                  {[
                    ['image-extractor','Photo Extractor','ImageIcon','text-emerald-500'],
                    ['contrast-checker','WCAG Matrix','Check','text-emerald-500'],
                    ['gradient-maker','Gradient Studio','Sliders','text-rose-500'],
                    ['ui-preview','UI Mockup','Laptop','text-amber-500'],
                    ['color-blindness','Color Blind Sim','Eye','text-emerald-500'],
                    ['brand-colors','Brand Tokens','Layers','text-indigo-500'],
                    ['ai-studio','Prompt Studio','Sparkles','text-purple-500'],
                  ].map(([key,label])=> (
                    <button key={key} onClick={()=>handleNavClick('tools', key)} className="text-left px-3 py-2 rounded-xl hover:bg-neutral-50 text-neutral-700 text-xs font-medium">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              id="nav-collections"
              onClick={() => handleNavClick('collections')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'collections'
                  ? 'text-neutral-900 bg-neutral-100 font-semibold'
                  : 'hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-rose-500" />
              <span>Saved</span>
              {(savedPaletteIds.length > 0 || likedPaletteIds.length > 0) && (
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 ml-0.5">
                  {savedPaletteIds.length + likedPaletteIds.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Expansive Intelligent Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl min-w-[280px] mx-2 lg:mx-4">
          <IntelligentSearchBar />
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            id="mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${
              mobileSearchOpen ? 'bg-indigo-50 text-indigo-600' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            aria-label="Toggle search bar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Create Palette Button */}
          <button
            id="header-create-palette-btn"
            onClick={onOpenCreate}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Palette</span>
          </button>

          {/* Live Palette Count Badge */}
          <div className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>7,900+ Original Palettes</span>
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-2 border-t border-neutral-200/80 bg-neutral-50/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
          <IntelligentSearchBar
            isMobile
            onCloseMobile={() => setMobileSearchOpen(false)}
          />
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
