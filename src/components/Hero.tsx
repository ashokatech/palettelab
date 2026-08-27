import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { Sparkles, ArrowRight, Image as ImageIcon, Zap, ShieldCheck, Download, Code2 } from 'lucide-react';
import { HeroInteractiveBar } from './HeroInteractiveBar';

interface HeroProps {
  onOpenCreate: () => void;
}

const TRENDING_SEARCH_CHIPS = [
  { label: '🌸 Pastel', query: 'pastel' },
  { label: '⚡ Cyberpunk Neon', query: 'neon' },
  { label: '☕ Warm Autumn', query: 'warm' },
  { label: '🌙 Dark Mode UI', query: 'dark' },
  { label: '🌊 Ocean Breeze', query: 'ocean' },
  { label: '🌿 Earth & Forest', query: 'earth' },
  { label: '👑 Gold Luxury', query: 'gold' },
  { label: '🍂 80s Retro', query: 'retro' },
];

export const Hero: React.FC<HeroProps> = ({ onOpenCreate }) => {
  const { setActiveTab, setToolSubTab, updateFilter } = usePalette();

  const handleChipClick = (query: string) => {
    updateFilter('searchQuery', query);
    const el = document.getElementById('palette-discovery-grid');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero-section"
      className="relative border-b border-neutral-200/80 bg-gradient-to-b from-neutral-50/80 via-white to-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header & Value Proposition */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Curated Design Schemes & Generator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.12]">
            Discover, generate & extract{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              perfect color palettes.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            3,900+ original color schemes, instant spacebar generator, photo color extraction, and CSS/Tailwind export — 100% mathematically generated.
          </p>
        </div>

        {/* Centerpiece: Interactive Spacebar Studio Swatch Bar */}
        <div className="max-w-4xl mx-auto">
          <HeroInteractiveBar />
        </div>

        {/* Quick Discovery Mood Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs font-semibold text-neutral-400 mr-1">Trending Themes:</span>
          {TRENDING_SEARCH_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.query)}
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/90 text-neutral-700 hover:text-neutral-900 text-xs font-medium transition-all hover:scale-105 shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Feature Pill Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2 border-t border-neutral-100 text-xs text-neutral-500">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>1-Click Fast Copy</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <span>Photo Color Extractor</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>Tailwind & CSS Tokens</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-neutral-50">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>WCAG 2.1 Accessibility</span>
          </div>
        </div>

      </div>
    </section>
  );
};

