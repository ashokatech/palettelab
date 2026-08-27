import React, { useState, Suspense, lazy } from 'react';
import { PaletteProvider, usePalette } from './context/PaletteContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiscoveryFilters } from './components/DiscoveryFilters';
import { PaletteCard } from './components/PaletteCard';
import { PaletteMockupCard } from './components/PaletteMockupCard';
import { CreatePaletteModal } from './components/CreatePaletteModal';
import { ToastContainer } from './components/ToastContainer';
import { AdContainer } from './components/AdContainer';
import { SeoFooter } from './components/SeoFooter';
import { SeoFaqSection } from './components/SeoFaqSection';
import { Sparkles, RotateCcw, Zap, Layers, Image as ImageIcon } from 'lucide-react';
import { PaletteViewMode } from './types';

// Heavy views lazy-loaded — cuts initial JS ~40%
const PaletteGenerator = lazy(() => import('./components/PaletteGenerator').then(m => ({ default: m.PaletteGenerator })));
const IndividualPaletteView = lazy(() => import('./components/IndividualPaletteView').then(m => ({ default: m.IndividualPaletteView })));
const ColorEncyclopediaView = lazy(() => import('./components/ColorEncyclopediaView').then(m => ({ default: m.ColorEncyclopediaView })));
const ToolsView = lazy(() => import('./components/ToolsView').then(m => ({ default: m.ToolsView })));
const CollectionsView = lazy(() => import('./components/CollectionsView').then(m => ({ default: m.CollectionsView })));

const LazyFallback: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
  </div>
);

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setToolSubTab,
    selectedPalette,
    filteredPalettes,
    resetFilters,
  } = usePalette();

  const goTool = (tool: any) => {
    setToolSubTab(tool);
    setActiveTab('tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [viewMode, setViewMode] = useState<PaletteViewMode>('grid');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 text-neutral-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sticky Header */}
      <Header
        onOpenCreate={() => setCreateModalOpen(true)}
      />

      {/* Main View Router — lazy heavy routes */}
      <main className="flex-1">
        <Suspense fallback={<LazyFallback />}>
        {selectedPalette && activeTab === 'palette-detail' ? (
          <IndividualPaletteView palette={selectedPalette} />
        ) : activeTab === 'color-detail' ? (
          <ColorEncyclopediaView />
        ) : activeTab === 'tools' ? (
          <ToolsView />
        ) : activeTab === 'generator' ? (
          <PaletteGenerator />
        ) : activeTab === 'collections' ? (
          <CollectionsView />
        ) : (
          /* Main Palette Discovery Homepage */
          <div className="space-y-8">
            {/* Interactive Hero */}
            <Hero onOpenCreate={() => setCreateModalOpen(true)} />

            {/* Discovery Feed Section */}
            <div id="palette-discovery-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

              {/* Category & Attribute Filters */}
              <DiscoveryFilters viewMode={viewMode} setViewMode={setViewMode} />

              {/* Responsive Palettes Grid */}
              {filteredPalettes.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPalettes.slice(0, visibleCount).map((palette, index) => (
                      <React.Fragment key={palette.id}>
                        {viewMode === 'mockup' ? (
                          <PaletteMockupCard palette={palette} />
                        ) : (
                          <PaletteCard palette={palette} />
                        )}
                        {(index + 1) % 8 === 0 && (
                          <AdContainer type="native-card" index={Math.floor(index / 8)} key={`ad-${index}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleCount < filteredPalettes.length && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 24)}
                        className="px-6 py-2.5 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 font-semibold text-sm shadow-2xs hover:bg-neutral-50 transition-all"
                      >
                        Load More Palettes ({filteredPalettes.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-900">No matching palettes found</h3>
                    <p className="text-xs text-neutral-500">
                      Try adjusting your color, mood, or search criteria.
                    </p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}

              {/* Homepage SEO Competitor-Beater Guide & Value Highlights */}
              <div className="mt-16 pt-12 border-t border-neutral-200/80 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                    Why Designers & Developers Choose PaletteLab
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Engineered for high-speed exploration, mathematical color harmonies, and comprehensive code export.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => setActiveTab('generator')} className="text-left p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 hover:border-indigo-200 hover:shadow-xs transition-all">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
                    <h3 className="text-sm font-bold text-neutral-900">Spacebar Harmonic Studio</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Press Space to generate, lock colors, and export Tailwind CSS tokens instantly.</p>
                  </button>
                  <button onClick={() => goTool('image-extractor')} className="text-left p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 hover:border-indigo-200 hover:shadow-xs transition-all">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
                    <h3 className="text-sm font-bold text-neutral-900">Photo Color Extractor</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">Drop any photo → 7-dimension palette (Vibrant/Pastel/Shadows/Highlights/Warm/Cool) with loupe eyedropper.</p>
                  </button>
                  <button onClick={() => goTool('contrast-checker')} className="text-left p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 hover:border-indigo-200 hover:shadow-xs transition-all">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                    <h3 className="text-sm font-bold text-neutral-900">Color Encyclopedia & WCAG</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">RGB/HSL/CMYK/LAB, 20-step tints/shades, 5×5 contrast matrix, and blindness simulator.</p>
                  </button>
                </div>
                {/* Deep links to 7 tools — previously hidden behind 1 Tools pill, now homepage + SEO */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
                  {[
                    ['Photo Extractor','image-extractor'],['WCAG Matrix','contrast-checker'],['Gradient Studio','gradient-maker'],['UI Mockups','ui-preview'],['Blindness Sim','color-blindness'],['Brand Tokens','brand-colors'],['Prompt Studio','ai-studio'],
                  ].map(([label,tool])=>(
                    <button key={tool as string} onClick={() => goTool(tool as any)} className="px-3 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors">{label}</button>
                  ))}
                </div>
              </div>

              {/* Comprehensive SEO FAQ Knowledge Base (Ranks for Google Rich Snippets) */}
              <SeoFaqSection />

            </div>
          </div>
        )}
        </Suspense>
      </main>

      {/* Programmatic SEO Footer */}
      <SeoFooter />

      {/* Modals & Portals */}
      <CreatePaletteModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Global Toast Notification System */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <PaletteProvider>
      <MainContent />
    </PaletteProvider>
  );
}
