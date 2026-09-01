import React from 'react';
import { usePalette } from '../context/PaletteContext';
import { CATEGORIES } from '../data/seedPalettes';
import { ColorTone, ToolSubTab } from '../types';

export const SeoFooter: React.FC = () => {
  const { updateFilter, setActiveTab, closePalette, setToolSubTab } = usePalette();

  // SPA-safe anchor handler — prevents full navigation but lets crawlers follow real hrefs
  const spaNavigate = (fn: () => void) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    fn();
  };

  const handleCategoryClick = (catKey: string) => {
    closePalette();
    updateFilter('category', catKey);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const seoColorLinks: { tone: ColorTone; label: string; param: string }[] = [
    { tone: 'blue', label: 'Blue Color Palettes', param: '?tab=discover&category=cool' },
    { tone: 'red', label: 'Red Color Palettes', param: '?tab=discover&category=warm' },
    { tone: 'green', label: 'Green Color Palettes', param: '?tab=discover&category=nature' },
    { tone: 'purple', label: 'Purple & Pastel Palettes', param: '?tab=discover&category=pastel' },
    { tone: 'pink', label: 'Pink & Soft Palettes', param: '?tab=discover&colorTone=pink' },
    { tone: 'orange', label: 'Orange & Sunset Palettes', param: '?tab=discover&category=warm' },
    { tone: 'teal', label: 'Teal & Cyan Palettes', param: '?tab=discover&category=cool' },
    { tone: 'neutral', label: 'Neutral & Earth Palettes', param: '?tab=discover&category=neutral' },
  ];

  const toolLinks: { tab: ToolSubTab; label: string; desc: string }[] = [
    { tab: 'image-extractor', label: 'Photo Extractor', desc: 'Extract colors from image' },
    { tab: 'contrast-checker', label: 'WCAG Contrast Matrix', desc: '5x5 contrast checker' },
    { tab: 'gradient-maker', label: 'Gradient Studio', desc: 'CSS & Tailwind gradients' },
    { tab: 'color-blindness', label: 'Color Blind Simulator', desc: 'Daltonism audit' },
    { tab: 'brand-colors', label: 'Brand Tokens', desc: 'Famous brand palettes' },
    { tab: 'ui-preview', label: 'UI Mockup Preview', desc: 'SaaS & Mobile preview' },
    { tab: 'ai-studio', label: 'Prompt Studio', desc: 'Text to palette' },
    { tab: 'shades-tints', label: 'Shades & Tints', desc: 'Monochrome scales' },
  ];

  return (
    <footer id="main-seo-footer" className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">

        {/* Brand & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-neutral-800">
          <div className="md:col-span-5 space-y-4">
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
              designers, developers, and creators. Explore 7,900+ mathematically generated color schemes, copy CSS &amp;
              Tailwind variables in one click, and check WCAG contrast compliance. 100% original — no scraping.
            </p>
          </div>

          {/* Categories — crawlable anchors */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {CATEGORIES.filter(c=>c.key!=='all').map((cat) => (
                <li key={cat.key}>
                  <a
                    href={`?tab=discover&category=${cat.key}`}
                    onClick={spaNavigate(() => handleCategoryClick(cat.key))}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat.name} Palettes
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Color Collections — crawlable anchors */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Color Collections</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {seoColorLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.param}
                    onClick={spaNavigate(() => {
                      closePalette();
                      updateFilter('colorTone', link.tone);
                      setActiveTab('discover');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    })}
                    className="hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools — crawlable anchors */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Design Tools</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {toolLinks.map((t) => (
                <li key={t.tab}>
                  <a
                    href={`?tab=tools&tool=${t.tab}`}
                    onClick={spaNavigate(() => {
                      closePalette();
                      setToolSubTab(t.tab);
                      setActiveTab('tools');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    })}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t.label} <span className="text-neutral-500 hidden xl:inline">— {t.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-neutral-800">
              <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">Recommended (affiliate)</h5>
              <ul className="space-y-1 text-xs text-neutral-400">
                <li><a href="https://tailwindui.com/?ref=palettelab" target="_blank" rel="sponsored nofollow noopener" className="hover:text-white">Tailwind UI →</a></li>
                <li><a href="https://www.figma.com/community?ref=palettelab" target="_blank" rel="sponsored nofollow noopener" className="hover:text-white">Figma Community →</a></li>
                <li><a href="https://www.canva.com/join/?ref=palettelab" target="_blank" rel="sponsored nofollow noopener" className="hover:text-white">Canva Pro →</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar + Legal (AdSense required) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} PaletteLab. 7,900+ original palettes • WCAG 2.1 • 100% math-generated</p>
          <div className="flex items-center gap-4">
            <a href="/privacy.html" className="hover:text-white transition-colors underline underline-offset-4">Privacy</a>
            <span>•</span>
            <a href="/terms.html" className="hover:text-white transition-colors underline underline-offset-4">Terms</a>
            <span>•</span>
            <a href="/sitemap.xml" className="hover:text-white transition-colors underline underline-offset-4">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
