import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { Sparkles, Palette, Layers } from 'lucide-react';
import { CATEGORIES } from '../data/seedPalettes';
import { ColorTone } from '../types';

export const SeoFooter: React.FC = () => {
  const { updateFilter, setActiveTab, closePalette } = usePalette();

  const seoColorLinks: { tone: ColorTone; label: string; slug: string }[] = [
    { tone: 'blue', label: 'Blue Color Palettes', slug: 'palettes/blue' },
    { tone: 'red', label: 'Red Color Palettes', slug: 'palettes/red' },
    { tone: 'green', label: 'Green Color Palettes', slug: 'palettes/green' },
    { tone: 'purple', label: 'Purple Color Palettes', slug: 'palettes/purple' },
    { tone: 'pink', label: 'Pastel Pink Palettes', slug: 'palettes/pink' },
    { tone: 'dark', label: 'Dark Mode Palettes', slug: 'palettes/dark' },
    { tone: 'neutral', label: 'Neutral & Earthy Palettes', slug: 'palettes/neutral' },
    { tone: 'orange', label: 'Sunset & Warm Palettes', slug: 'palettes/warm' },
  ];

  const handleCategoryClick = (catKey: string) => {
    closePalette();
    updateFilter('category', catKey);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleColorClick = (tone: ColorTone) => {
    closePalette();
    updateFilter('colorTone', tone);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-seo-footer" className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        
        {/* Brand & Mission Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center p-1 border border-neutral-700">
                <div className="w-full h-full rounded-lg grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden">
                  <span className="bg-amber-400"></span>
                  <span className="bg-rose-500"></span>
                  <span className="bg-teal-400"></span>
                  <span className="bg-indigo-500"></span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Palette<span className="text-indigo-400">Lab</span>
              </span>
            </div>
            
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              PaletteLab is an original color discovery platform and harmonic generator built for
              designers, developers, and creators. Explore 7,900+ mathematically generated color schemes, copy CSS &
              Tailwind variables in one click, and check WCAG contrast compliance. No scraping — 100% original.
            </p>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {CATEGORIES.slice(1, 8).map((cat) => (
                <li key={cat.key}>
                  <button
                    onClick={() => handleCategoryClick(cat.key)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name} Palettes
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Color Palettes Directory (Programmatic SEO Directory) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Color Collections</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {seoColorLinks.map((link) => (
                <li key={link.slug}>
                  <button
                    onClick={() => handleColorClick(link.tone)}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar + Legal (AdSense required) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} PaletteLab. Crafted for modern web & UI design.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy.html" className="hover:text-white transition-colors underline underline-offset-4">Privacy</a>
            <span>•</span>
            <a href="/terms.html" className="hover:text-white transition-colors underline underline-offset-4">Terms</a>
            <span>•</span>
            <span className="hidden sm:inline">WCAG 2.1 Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
