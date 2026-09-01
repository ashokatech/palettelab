import React, { useState } from 'react';
import { Palette } from '../types';
import { usePalette } from '../context/PaletteContext';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Bookmark, 
  Copy, 
  Download, 
  Code, 
  Check, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  getColorDetails, 
  formatCssVariables, 
  formatTailwindConfig 
} from '../utils/colorUtils';
import { PaletteCard } from './PaletteCard';

interface IndividualPaletteViewProps {
  palette: Palette;
}

export const IndividualPaletteView: React.FC<IndividualPaletteViewProps> = ({ palette }) => {
  const { 
    closePalette, 
    toggleLike, 
    likedPaletteIds, 
    savedPaletteIds, 
    toggleSave, 
    copyValue, 
    showToast,
    palettes,
    setGeneratorPaletteFromColors,
    openColorDetail
  } = usePalette();

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'json'>('css');

  const isLiked = likedPaletteIds.includes(palette.id);
  const isSaved = savedPaletteIds.includes(palette.id);

  // Find similar palettes (same category or sharing color tones) + infinite shuffle
  const similarBase = React.useMemo(()=> palettes.filter((p) => p.id !== palette.id && (p.category === palette.category || p.tags.some((t) => palette.tags.includes(t)))), [palettes, palette.id, palette.category, palette.tags]);
  const [similarCount, setSimilarCount] = useState(8);
  const similarPalettes = similarBase.slice(0, similarCount);
  // Keyboard nav for dwell: ArrowLeft/Right to browse similar
  React.useEffect(()=>{
    const h = (e:KeyboardEvent)=>{
      if (e.key==='ArrowRight' && similarBase[0]) { const idx = similarBase.findIndex(p=>p.id===palette.id); /* noop */ }
    };
    return ()=>{};
  },[]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${palette.name} - PaletteLab`,
          text: `Check out ${palette.name} color palette on PaletteLab`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    copyValue(url, 'Palette URL copied to clipboard');
  };

  const handleDownloadImage = () => {
    // Generate an image via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1200, 630);

    const slotWidth = 1200 / palette.colors.length;
    palette.colors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(i * slotWidth, 0, slotWidth, 480);

      // Draw label
      ctx.fillStyle = getColorDetails(hex).isDark ? '#FFFFFF' : '#111111';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(hex, i * slotWidth + 24, 440);
    });

    // Draw footer
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${palette.name} • PaletteLab`, 32, 550);

    ctx.fillStyle = '#777777';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Curated by ${palette.creator.name}`, 32, 585);

    const link = document.createElement('a');
    link.download = `${palette.slug}-palette.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast({ type: 'success', title: 'Palette PNG Downloaded!' });
  };

  return (
    <div id="individual-palette-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={closePalette}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLike(palette.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span>{palette.likes} Likes</span>
          </button>

          <button
            onClick={() => toggleSave(palette.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
            title="Save Palette"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            title="Share Palette"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadImage}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Primary Palette Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            {palette.category}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            /palette/{palette.slug}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          {palette.name}
        </h1>
        <p className="text-sm text-neutral-500 flex items-center gap-2">
          <span>Curated by {palette.creator.name}</span>
          <span>•</span>
          <span>Added on {palette.createdAt}</span>
          <span>•</span>
          <span>{palette.views} views</span>
        </p>
      </div>

      {/* Large Dominant Palette Layout */}
      <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-md flex border border-neutral-200">
        {palette.colors.map((hex, idx) => {
          const colorInfo = getColorDetails(hex);
          return (
            <div
              key={idx}
              style={{ backgroundColor: hex }}
              onClick={() => copyValue(hex, `Copied ${hex}`, hex)}
              className="flex-1 h-full relative group flex flex-col justify-end p-4 transition-all hover:flex-[1.5] cursor-pointer"
            >
              <div
                className={`py-2 px-3 rounded-xl font-mono text-sm font-bold tracking-wider text-center backdrop-blur-md shadow-xs transition-transform group-hover:scale-105 ${
                  colorInfo.isDark ? 'bg-black/40 text-white' : 'bg-white/70 text-neutral-900'
                }`}
              >
                {hex}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Breakdown Table: HEX, RGB, HSL, CMYK, Contrast */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-neutral-900">Color Values & Accessibility</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {palette.colors.map((hex, idx) => {
            const info = getColorDetails(hex);
            return (
              <div
                key={idx}
                className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-neutral-200 shadow-inner shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <div className="min-w-0">
                    <button
                      onClick={() => copyValue(hex, `Copied ${hex}`, hex)}
                      className="text-sm font-bold font-mono text-neutral-900 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <span>{hex}</span>
                      <Copy className="w-3 h-3 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => openColorDetail(hex)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <span>Color-Hex Info</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 font-mono text-neutral-600 border-t border-neutral-200/60 pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-sans">RGB:</span>
                    <span>{info.rgb.r}, {info.rgb.g}, {info.rgb.b}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-sans">HSL:</span>
                    <span>{info.hsl.h}°, {info.hsl.s}%, {info.hsl.l}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-sans">CMYK:</span>
                    <span>{info.cmyk.c}%, {info.cmyk.m}%, {info.cmyk.y}%, {info.cmyk.k}%</span>
                  </div>
                  <div className="flex justify-between text-neutral-700 font-semibold pt-1 border-t border-neutral-100">
                    <span className="text-neutral-400 font-sans">WCAG Ratio:</span>
                    <span>{info.contrastWithWhite}:1 (on W)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Snippet Box (:root CSS & Tailwind) */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-neutral-900">Developer Code Snippets</h2>
          </div>

          <div className="flex items-center gap-1">
            {(['css', 'tailwind', 'json'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                  activeTab === tab
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
          <pre>
            {activeTab === 'css' && formatCssVariables(palette.colors, palette.name)}
            {activeTab === 'tailwind' && formatTailwindConfig(palette.colors, palette.slug)}
            {activeTab === 'json' && JSON.stringify({ name: palette.name, colors: palette.colors }, null, 2)}
          </pre>

          <button
            onClick={() => {
              let text = '';
              if (activeTab === 'css') text = formatCssVariables(palette.colors, palette.name);
              if (activeTab === 'tailwind') text = formatTailwindConfig(palette.colors, palette.slug);
              if (activeTab === 'json') text = JSON.stringify({ name: palette.name, colors: palette.colors }, null, 2);
              copyValue(text, `Copied ${activeTab.toUpperCase()} snippet`);
            }}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => setGeneratorPaletteFromColors(palette.colors)}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open in Harmonic Generator</span>
          </button>
        </div>
      </div>

      {/* "More palettes like this" Section — expanded infinite + affiliate */}
      {similarBase.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-neutral-900">More palettes like this</h2>
            <span className="text-xs text-neutral-500">Related {palette.category} — {similarBase.length} matches</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarPalettes.map((sim) => (
              <PaletteCard key={sim.id} palette={sim} />
            ))}
          </div>
          {similarCount < similarBase.length && (
            <div className="flex justify-center">
              <button onClick={()=> setSimilarCount(c=> Math.min(c+8, similarBase.length))} className="px-5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-semibold hover:bg-neutral-50">Show 8 more ({similarBase.length - similarCount} left)</button>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-sm font-bold">Love this palette? Use it in your project</p><p className="text-xs text-neutral-400">Export to Figma, Tailwind, or edit in Canva — affiliate supports free palettes.</p></div>
            <div className="flex gap-2">
              <a href="https://www.figma.com/community" target="_blank" rel="sponsored nofollow noopener" className="px-3 py-2 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100">Open in Figma</a>
              <a href="https://www.canva.com/color-palette-generator/" target="_blank" rel="sponsored nofollow noopener" className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">Edit in Canva</a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
