import React, { useState, useEffect, useCallback } from 'react';
import { usePalette } from '../context/PaletteContext';
import { 
  Lock, 
  Unlock, 
  RefreshCw, 
  Plus, 
  Minus, 
  Copy, 
  Share2, 
  Bookmark, 
  Check, 
  Code, 
  Sliders, 
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { 
  getColorDetails, 
  formatCssVariables, 
  formatTailwindConfig, 
  hexToRgb, 
  rgbToHsl, 
  hslToRgb, 
  rgbToHex 
} from '../utils/colorUtils';

export const PaletteGenerator: React.FC = () => {
  const {
    generatorSlots,
    generateRandomPalette,
    toggleSlotLock,
    setSlotColor,
    addSlot,
    removeSlot,
    copyValue,
    showToast,
    saveNewPalette,
  } = usePalette();

  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(0);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [codeTab, setCodeTab] = useState<'css' | 'tailwind' | 'hex' | 'json'>('css');
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [paletteName, setPaletteName] = useState<string>('My Harmonic Palette');

  // Spacebar hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        generateRandomPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateRandomPalette]);

  const activeSlot = activeColorIndex !== null ? generatorSlots[activeColorIndex] : null;
  const activeColorInfo = activeSlot ? getColorDetails(activeSlot.hex) : null;

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    if (activeColorIndex === null || !activeColorInfo) return;
    const current = activeColorInfo.rgb;
    const newRgb = { ...current, [channel]: Math.max(0, Math.min(255, val)) };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setSlotColor(activeColorIndex, newHex);
  };

  const handleHslChange = (channel: 'h' | 's' | 'l', val: number) => {
    if (activeColorIndex === null || !activeColorInfo) return;
    const current = activeColorInfo.hsl;
    const maxVal = channel === 'h' ? 360 : 100;
    const newHsl = { ...current, [channel]: Math.max(0, Math.min(maxVal, val)) };
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSlotColor(activeColorIndex, newHex);
  };

  const colorsList = generatorSlots.map((s) => s.hex);

  const handleSavePalette = () => {
    saveNewPalette(paletteName, colorsList, 'Trending', ['generator', 'custom']);
    setSaveModalOpen(false);
  };

  const handleDownloadSvg = () => {
    const width = 1200;
    const height = 630;
    const slotWidth = width / generatorSlots.length;

    const rects = generatorSlots
      .map(
        (s, i) => `
      <rect x="${i * slotWidth}" y="0" width="${slotWidth}" height="${height}" fill="${s.hex}" />
      <text x="${i * slotWidth + 30}" y="${height - 40}" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">${s.hex}</text>
    `
      )
      .join('\n');

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      ${rects}
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `palettelab-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', title: 'SVG Palette Downloaded!' });
  };

  return (
    <div id="palette-generator-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Action & Instructions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              Harmonic Palette Generator
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                Press Spacebar
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Lock colors you love, then press Space to harmonize the rest.
            </p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="generator-randomize-btn"
            onClick={generateRandomPalette}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate</span>
          </button>

          <button
            id="generator-export-btn"
            onClick={() => setShowCodeModal(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-neutral-50 transition-colors"
          >
            <Code className="w-4 h-4 text-indigo-500" />
            <span>Export Code</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="p-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
            title="Download SVG Swatch"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>Save</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Stage / Color Bars */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="h-80 sm:h-96 w-full flex flex-col sm:flex-row overflow-hidden relative">
          {generatorSlots.map((slot, idx) => {
            const colorInfo = getColorDetails(slot.hex);
            const isSelected = activeColorIndex === idx;

            return (
              <div
                key={slot.id}
                style={{ backgroundColor: slot.hex }}
                onClick={() => setActiveColorIndex(idx)}
                className={`flex-1 relative flex flex-col justify-between p-4 transition-all duration-200 group cursor-pointer ${
                  isSelected ? 'ring-4 ring-indigo-500 ring-inset z-10' : ''
                }`}
              >
                {/* Top Slot Controls: Lock, Remove */}
                <div className="flex items-center justify-between gap-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSlotLock(idx);
                    }}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm ${
                      slot.isLocked
                        ? 'bg-white text-neutral-900 ring-2 ring-indigo-500'
                        : colorInfo.isDark
                        ? 'bg-black/30 hover:bg-black/50 text-white'
                        : 'bg-white/40 hover:bg-white/70 text-neutral-900'
                    }`}
                    title={slot.isLocked ? 'Unlock color' : 'Lock color'}
                  >
                    {slot.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  {generatorSlots.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlot(idx);
                        if (activeColorIndex === idx) setActiveColorIndex(0);
                      }}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 ${
                        colorInfo.isDark
                          ? 'bg-black/30 hover:bg-rose-600 text-white'
                          : 'bg-white/40 hover:bg-rose-500 hover:text-white text-neutral-900'
                      }`}
                      title="Remove color slot"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Center / Bottom Info */}
                <div className="flex flex-col items-center gap-1.5 text-center z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyValue(slot.hex, `Copied ${slot.hex}`, slot.hex);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider backdrop-blur-md transition-transform hover:scale-105 shadow-sm ${
                      colorInfo.isDark ? 'bg-black/40 text-white' : 'bg-white/60 text-neutral-900'
                    }`}
                    title="Click to copy HEX"
                  >
                    {slot.hex}
                  </button>

                  <span
                    className={`text-[11px] font-medium transition-opacity ${
                      colorInfo.isDark ? 'text-white/70' : 'text-neutral-900/70'
                    }`}
                  >
                    Slot {idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar: Add Color Slot */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Info className="w-4 h-4 text-neutral-400" />
            <span>Click any color column to fine-tune in the color inspector below.</span>
          </div>

          {generatorSlots.length < 6 && (
            <button
              onClick={addSlot}
              className="px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color ({generatorSlots.length}/6)</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Color Inspector & Tuner */}
      {activeSlot && activeColorInfo && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border border-neutral-200 shadow-inner"
                style={{ backgroundColor: activeSlot.hex }}
              />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Tuning Slot {(activeColorIndex ?? 0) + 1}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">{activeSlot.hex}</p>
              </div>
            </div>

            {/* Quick Hex Text Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-400">HEX:</span>
              <input
                type="text"
                value={activeSlot.hex}
                onChange={(e) => {
                  if (activeColorIndex !== null) {
                    setSlotColor(activeColorIndex, e.target.value);
                  }
                }}
                className="w-24 px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-100 outline-none"
              />
              <input
                type="color"
                value={activeSlot.hex}
                onChange={(e) => {
                  if (activeColorIndex !== null) {
                    setSlotColor(activeColorIndex, e.target.value);
                  }
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>

          {/* Sliders: RGB and HSL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* RGB Controls */}
            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">RGB Channels</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Red (R)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.rgb.r}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={activeColorInfo.rgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Green (G)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.rgb.g}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={activeColorInfo.rgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Blue (B)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.rgb.b}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={activeColorInfo.rgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            {/* HSL Controls */}
            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">HSL Spectrum</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Hue (H)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.hsl.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={activeColorInfo.hsl.h}
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Saturation (S)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.hsl.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeColorInfo.hsl.s}
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Lightness (L)</span>
                  <span className="font-mono font-semibold">{activeColorInfo.hsl.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeColorInfo.hsl.l}
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Code Export Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Export Palette Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
              {(['css', 'tailwind', 'hex', 'json'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                    codeTab === tab
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code Snippet Box */}
            <div className="relative bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-60">
              <pre>
                {codeTab === 'css' && formatCssVariables(colorsList, 'PaletteLab Generator')}
                {codeTab === 'tailwind' && formatTailwindConfig(colorsList, 'custom-palette')}
                {codeTab === 'hex' && colorsList.join(', ')}
                {codeTab === 'json' && JSON.stringify(colorsList, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  let text = '';
                  if (codeTab === 'css') text = formatCssVariables(colorsList, 'PaletteLab Generator');
                  if (codeTab === 'tailwind') text = formatTailwindConfig(colorsList, 'custom-palette');
                  if (codeTab === 'hex') text = colorsList.join(', ');
                  if (codeTab === 'json') text = JSON.stringify(colorsList, null, 2);
                  copyValue(text, `Copied ${codeTab.toUpperCase()} Snippet`);
                  setShowCodeModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Save to My Palettes</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-600">Palette Name</label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="e.g. Sunset Reverie"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div className="h-12 rounded-xl overflow-hidden flex border border-neutral-200">
              {colorsList.map((c, i) => (
                <div key={i} style={{ backgroundColor: c }} className="flex-1 h-full" />
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePalette}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
