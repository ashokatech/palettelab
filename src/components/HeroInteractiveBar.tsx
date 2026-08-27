import React, { useState, useEffect, useRef } from 'react';
import { usePalette } from '../context/PaletteContext';
import { 
  Sparkles, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  SlidersHorizontal,
  Code2,
  Share2,
  Maximize2,
  Eye
} from 'lucide-react';
import { 
  generateHarmonicPalette, 
  getColorDetails, 
  normalizeHex,
  formatCssVariables,
  formatTailwindConfig,
  hslToRgb,
  rgbToHex,
  hexToRgb,
  rgbToHsl
} from '../utils/colorUtils';

const HARMONY_MODES = [
  { id: 'auto', name: 'Auto Harmonic' },
  { id: 'pastel', name: 'Pastel Dream' },
  { id: 'neon', name: 'Cyberpunk Neon' },
  { id: 'sunset', name: 'Warm Sunset' },
  { id: 'ocean', name: 'Ocean & Mint' },
  { id: 'luxe', name: 'Dark Luxury' },
  { id: 'earth', name: 'Earthy Botanical' },
];

export const HeroInteractiveBar: React.FC = () => {
  const { 
    setActiveTab, 
    setToolSubTab, 
    copyValue, 
    setGeneratorPaletteFromColors,
    saveNewPalette,
    showToast 
  } = usePalette();

  const [colors, setColors] = useState<string[]>([
    '#264653',
    '#2A9D8F',
    '#E9C46A',
    '#F4A261',
    '#E76F51',
  ]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [selectedHarmony, setSelectedHarmony] = useState('auto');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Generate new colors respecting locked slots
  const generateNewColors = (harmony = selectedHarmony) => {
    let baseHex: string | undefined = undefined;
    let baseH = Math.floor(Math.random() * 360);

    // If any locked, pick first locked as base
    const firstLockedIdx = locked.findIndex((l) => l);
    if (firstLockedIdx !== -1) {
      baseHex = colors[firstLockedIdx];
      const rgb = hexToRgb(baseHex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      baseH = hsl.h;
    }

    let generated: string[] = [];

    if (harmony === 'pastel') {
      generated = Array.from({ length: 5 }, (_, i) => {
        const h = (baseH + i * 50) % 360;
        const s = 45 + Math.floor(Math.random() * 20);
        const l = 78 + Math.floor(Math.random() * 10);
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      });
    } else if (harmony === 'neon') {
      const neonPresets = [
        ['#00F5D4', '#7B2CBF', '#F72585', '#4CC9F0', '#FFE600'],
        ['#FF007F', '#00F0FF', '#7928CA', '#00DFD8', '#FF4D4D'],
        ['#39FF14', '#FF073A', '#00F5D4', '#B5179E', '#7209B7'],
        ['#00E5FF', '#FF0055', '#FFE600', '#7678ED', '#F72585'],
      ];
      const randomPreset = neonPresets[Math.floor(Math.random() * neonPresets.length)];
      generated = [...randomPreset].sort(() => Math.random() - 0.5);
    } else if (harmony === 'sunset') {
      generated = Array.from({ length: 5 }, (_, i) => {
        const warmHues = [340, 355, 15, 35, 48];
        const h = warmHues[i % warmHues.length];
        const s = 70 + Math.floor(Math.random() * 25);
        const l = 30 + i * 14;
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      });
    } else if (harmony === 'ocean') {
      generated = Array.from({ length: 5 }, (_, i) => {
        const oceanHues = [215, 200, 190, 175, 160];
        const h = oceanHues[i % oceanHues.length];
        const s = 65 + Math.floor(Math.random() * 25);
        const l = 20 + i * 15;
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      });
    } else if (harmony === 'luxe') {
      const luxePresets = [
        ['#0D1117', '#161B22', '#D4AF37', '#E5C158', '#F5E6BE'],
        ['#121212', '#242424', '#C9A959', '#E6D5AC', '#FAF8F5'],
        ['#0F172A', '#1E293B', '#F59E0B', '#FCD34D', '#F8FAFC'],
      ];
      const randomLuxe = luxePresets[Math.floor(Math.random() * luxePresets.length)];
      generated = [...randomLuxe];
    } else if (harmony === 'earth') {
      generated = Array.from({ length: 5 }, (_, i) => {
        const earthHues = [95, 75, 40, 25, 110];
        const h = earthHues[i % earthHues.length];
        const s = 30 + Math.floor(Math.random() * 30);
        const l = 22 + i * 14;
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      });
    } else {
      generated = generateHarmonicPalette(baseHex, 5);
    }

    // Blend with locked
    const next = colors.map((col, idx) => (locked[idx] ? col : generated[idx] || col));
    setColors(next);
  };

  const toggleLock = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...locked];
    next[idx] = !next[idx];
    setLocked(next);
  };

  const handleCopySingle = (hex: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    copyValue(hex, `Copied ${hex}`, hex);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAllHex = () => {
    copyValue(colors.join(', '), 'Copied all 5 HEX codes to clipboard');
  };

  const handleCopyCssVars = () => {
    const css = formatCssVariables(colors, 'homepage-palette');
    copyValue(css, 'Copied CSS variables (:root) to clipboard');
  };

  const handleOpenStudio = () => {
    setGeneratorPaletteFromColors(colors);
  };

  const handleOpenPhotoExtractor = () => {
    setToolSubTab('image-extractor');
    setActiveTab('tools');
  };

  // Keyboard Spacebar Listener for Homepage Hero
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or select
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        setIsSpacePressed(true);
        generateNewColors();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [colors, locked, selectedHarmony]);

  return (
    <div
      id="hero-spacebar-studio-bar"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
          setToolSubTab('image-extractor');
          setActiveTab('tools');
          showToast({ type: 'info', title: 'Opening Image to Palette Extractor' });
        }
      }}
      className={`relative w-full bg-white rounded-3xl border transition-all duration-200 p-4 sm:p-5 shadow-lg ${
        isDragOver
          ? 'border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50/20'
          : 'border-neutral-200/90 hover:border-neutral-300'
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-neutral-100">
        
        {/* Left Status & Spacebar Prompt */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Spacebar Studio</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <span>Press</span>
            <kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-mono text-[11px] font-bold text-neutral-800 shadow-2xs">
              SPACEBAR
            </kbd>
            <span>to generate instantly</span>
          </div>
        </div>

        {/* Harmony Mode Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500 font-medium hidden md:inline">Mood:</label>
          <select
            value={selectedHarmony}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedHarmony(val);
              generateNewColors(val);
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border-none text-xs font-semibold text-neutral-800 outline-none cursor-pointer transition-colors"
          >
            {HARMONY_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Quick Re-roll Button */}
          <button
            onClick={() => generateNewColors()}
            title="Generate new harmony (Space)"
            className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Roll</span>
          </button>
        </div>

      </div>

      {/* Main 5-Color Interactive Swatch Strip */}
      <div className="mt-4 h-40 sm:h-48 rounded-2xl overflow-hidden flex border border-neutral-200/80 shadow-inner relative group/strip">
        {colors.map((hex, idx) => {
          const details = getColorDetails(hex);
          const isLocked = locked[idx];
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              style={{ backgroundColor: hex }}
              onClick={(e) => handleCopySingle(hex, idx, e)}
              className="flex-1 h-full relative transition-all duration-200 hover:flex-[1.8] flex flex-col justify-between p-3 sm:p-4 cursor-pointer group/slot"
              title={`Click to copy ${hex}`}
            >
              {/* Top Lock Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => toggleLock(idx, e)}
                  className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                    isLocked
                      ? 'bg-neutral-900/85 text-white shadow-sm ring-1 ring-white/20'
                      : 'opacity-0 group-hover/slot:opacity-100 bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                  }`}
                  title={isLocked ? 'Unlock color' : 'Lock color'}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bottom Color Code & Name Tag */}
              <div className="space-y-1">
                <div
                  className={`px-2 py-1 rounded-lg backdrop-blur-md text-xs font-mono font-bold tracking-wider flex items-center justify-between shadow-2xs transition-all ${
                    details.isDark ? 'bg-black/50 text-white' : 'bg-white/70 text-neutral-900'
                  } ${isCopied ? 'ring-2 ring-emerald-400 scale-105' : ''}`}
                >
                  <span className="truncate">{hex}</span>
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60 group-hover/slot:opacity-100 shrink-0 ml-1" />
                  )}
                </div>

                <p
                  className={`text-[11px] font-medium truncate px-1 hidden sm:block ${
                    details.isDark ? 'text-white/80' : 'text-neutral-900/80'
                  }`}
                >
                  {details.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Actions Strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyAllHex}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800 font-semibold transition-colors flex items-center gap-1.5"
            title="Copy all HEX codes"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-600" />
            <span>Copy All HEX</span>
          </button>

          <button
            onClick={handleCopyCssVars}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800 font-semibold transition-colors flex items-center gap-1.5"
            title="Copy CSS :root Variables"
          >
            <Code2 className="w-3.5 h-3.5 text-neutral-600" />
            <span>CSS Variables</span>
          </button>

          <button
            onClick={handleOpenPhotoExtractor}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors flex items-center gap-1.5"
            title="Drop or upload any photo to extract colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Extract from Photo</span>
          </button>
        </div>

        {/* Right Launch Full Studio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveNewPalette('Live Spacebar Harmony', colors, 'Generated', ['live', 'spacebar']);
              showToast({ type: 'success', title: 'Saved to your Library!' });
            }}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold transition-colors"
          >
            Save
          </button>

          <button
            onClick={handleOpenStudio}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Studio</span>
          </button>
        </div>

      </div>

    </div>
  );
};
