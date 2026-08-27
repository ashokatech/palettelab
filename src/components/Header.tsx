import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { IntelligentSearchBar } from './IntelligentSearchBar';
import { 
  Palette as PaletteIcon, 
  Wand2,
  Wrench,
  Sparkles,
  Bookmark, 
  Search, 
  Plus, 
  Menu, 
  X, 
  CheckCircle,
  Sliders,
  Eye,
  Laptop,
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
    toolSubTab,
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
              <Wand2 className="w-4 h-4 text-amber-500" />
              <span>Generator</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 ml-0.5">
                Space
              </span>
            </button>

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

      {/* Smart Tools Rail — front and center, not dropdown. Money tools always visible, horizontal scroll on mobile */}
      <div className="border-t border-neutral-100 bg-gradient-to-r from-white via-indigo-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide scroll-smooth">
            <span className="hidden lg:inline text-[11px] font-bold tracking-wider text-neutral-400 mr-1 whitespace-nowrap shrink-0">TOOLS →</span>
            {[
              {key:'image-extractor', label:'Extractor', Icon: ImageIcon, color:'text-emerald-600 bg-emerald-50 border-emerald-200', badge: null},
              {key:'contrast-checker', label:'WCAG Matrix', Icon: CheckCircle, color:'text-emerald-700 bg-emerald-50 border-emerald-200', badge:'HOT'},
              {key:'gradient-maker', label:'Gradients', Icon: Sliders, color:'text-rose-600 bg-rose-50 border-rose-200', badge:null},
              {key:'ui-preview', label:'UI Mockup', Icon: Laptop, color:'text-amber-600 bg-amber-50 border-amber-200', badge:null},
              {key:'color-blindness', label:'Blind Sim', Icon: Eye, color:'text-teal-600 bg-teal-50 border-teal-200', badge:null},
              {key:'brand-colors', label:'Brand Tokens', Icon: Layers, color:'text-indigo-600 bg-indigo-50 border-indigo-200', badge:null},
              {key:'ai-studio', label:'Prompt Studio', Icon: Sparkles, color:'text-purple-600 bg-purple-50 border-purple-200', badge:'NEW'},
            ].map((t) => {
              const isActive = activeTab==='tools' && toolSubTab===t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => handleNavClick('tools', t.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
                    isActive ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' : `bg-white ${t.color} hover:shadow-xs hover:scale-[1.02]`
                  }`}
                >
                  <t.Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  <span>{t.label}</span>
                  {t.badge && <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${isActive ? 'bg-white/20 text-white' : t.badge==='HOT' ? 'bg-amber-500 text-white' : 'bg-purple-600 text-white'}`}>{t.badge}</span>}
                </button>
              );
            })}
          </div>
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
