import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { ColorBlindnessType } from '../types';
import { 
  simulateColorBlindness, 
  getColorDetails, 
  getContrastRatio, 
  hexToRgb,
  rgbToHex 
} from '../utils/colorUtils';
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Info,
  ShieldCheck,
  Monitor
} from 'lucide-react';

interface VisionTypeInfo {
  type: ColorBlindnessType;
  title: string;
  category: string;
  prevalence: string;
  description: string;
}

const VISION_DEFICIENCIES: VisionTypeInfo[] = [
  {
    type: 'normal',
    title: 'Standard Trichromacy',
    category: 'Normal Vision',
    prevalence: '92% of population',
    description: 'Full-spectrum three-cone color perception across red, green, and blue wavelengths.',
  },
  {
    type: 'deuteranomaly',
    title: 'Deuteranomaly (Green-Weak)',
    category: 'Red-Green Deficiency',
    prevalence: '~5% of males, 0.4% females',
    description: 'Malfunctioning M-cones. Green tones shift warmer toward red; difficulty distinguishing subtle green/brown/reds.',
  },
  {
    type: 'deuteranopia',
    title: 'Deuteranopia (Green-Blind)',
    category: 'Red-Green Deficiency',
    prevalence: '~1.2% of males',
    description: 'Complete absence of M-cones. Reds, oranges, and greens collapse into muted khaki, yellows, and browns.',
  },
  {
    type: 'protanomaly',
    title: 'Protanomaly (Red-Weak)',
    category: 'Red-Green Deficiency',
    prevalence: '~1% of males',
    description: 'Malfunctioning L-cones. Reds appear darker and less saturated; red and black can be easily confused.',
  },
  {
    type: 'protanopia',
    title: 'Protanopia (Red-Blind)',
    category: 'Red-Green Deficiency',
    prevalence: '~1.3% of males',
    description: 'Complete absence of L-cones. Pure reds appear dark or black; oranges and greens appear golden-yellow.',
  },
  {
    type: 'tritanomaly',
    title: 'Tritanomaly (Blue-Weak)',
    category: 'Blue-Yellow Deficiency',
    prevalence: '~0.01% (rare)',
    description: 'Malfunctioning S-cones. Blue shifts greenish; yellow shifts lighter pink or grey.',
  },
  {
    type: 'tritanopia',
    title: 'Tritanopia (Blue-Blind)',
    category: 'Blue-Yellow Deficiency',
    prevalence: '~0.003% (very rare)',
    description: 'Complete absence of S-cones. Blues appear cyan/green, yellows appear light pink/violet.',
  },
  {
    type: 'achromatopsia',
    title: 'Achromatopsia (Monochromacy)',
    category: 'Complete Color Blindness',
    prevalence: '~0.003% (1 in 33,000)',
    description: 'Complete absence of all functioning cone cells. Pure vision based solely on rods; black, white, and shades of gray.',
  },
];

export const ColorBlindnessView: React.FC = () => {
  const { copyValue, showToast, palettes, setGeneratorPaletteFromColors } = usePalette();

  const [colors, setColors] = useState<string[]>([
    '#EF4444', // Red
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#111827', // Dark Slate
  ]);

  const [activePreviewType, setActivePreviewType] = useState<ColorBlindnessType>('deuteranopia');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute color confusion warnings: check if any two colors become too close in simulated RGB space
  const getConfusionWarnings = (type: ColorBlindnessType) => {
    if (type === 'normal') return [];

    const simColors = colors.map((c) => ({
      original: c,
      simulated: simulateColorBlindness(c, type),
    }));

    const warnings: { c1: string; c2: string; sim1: string; sim2: string; distance: number }[] = [];

    for (let i = 0; i < simColors.length; i++) {
      for (let j = i + 1; j < simColors.length; j++) {
        const rgb1 = hexToRgb(simColors[i].simulated);
        const rgb2 = hexToRgb(simColors[j].simulated);

        // Euclidean color distance
        const dist = Math.sqrt(
          Math.pow(rgb1.r - rgb2.r, 2) +
          Math.pow(rgb1.g - rgb2.g, 2) +
          Math.pow(rgb1.b - rgb2.b, 2)
        );

        if (dist < 42) {
          warnings.push({
            c1: simColors[i].original,
            c2: simColors[j].original,
            sim1: simColors[i].simulated,
            sim2: simColors[j].simulated,
            distance: Math.round(dist),
          });
        }
      }
    }

    return warnings;
  };

  const handleCopy = (hex: string, key: string) => {
    copyValue(hex, `Copied ${hex}`, hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleRandomize = () => {
    const randomPal = palettes[Math.floor(Math.random() * palettes.length)];
    if (randomPal) {
      setColors(randomPal.colors.slice(0, 5));
    }
  };

  const activeDeficiencyInfo = VISION_DEFICIENCIES.find((v) => v.type === activePreviewType) || VISION_DEFICIENCIES[0];
  const activeWarnings = getConfusionWarnings(activePreviewType);

  return (
    <div id="color-blindness-simulator" className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-stone-900 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daltonization & Accessibility Simulation Matrix</span>
          </div>

          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Random Palette</span>
          </button>
        </div>

        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Color Blindness Simulator & Auditor
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Over 300 million people worldwide experience color vision deficiency. Test your palettes against all 8 cone variations to eliminate legibility and confusion errors.
          </p>
        </div>

        {/* Live Editable Swatches Bar */}
        <div className="pt-4 space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Test Palette (Click color or type HEX)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {colors.map((hex, idx) => {
              const details = getColorDetails(hex);
              return (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => {
                        const next = [...colors];
                        next[idx] = e.target.value;
                        setColors(next);
                      }}
                      className="w-8 h-8 rounded-xl cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={hex.toUpperCase()}
                      onChange={(e) => {
                        const next = [...colors];
                        next[idx] = e.target.value;
                        setColors(next);
                      }}
                      className="w-full bg-white/10 px-2 py-1 rounded-lg text-xs font-mono font-bold text-white uppercase focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate px-1">
                    {details.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: 8 Vision Modes Simulation Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>All 8 Vision Deficiency Simulations</span>
              <span className="text-xs font-normal text-neutral-500">
                (Click card to inspect deep audit)
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {VISION_DEFICIENCIES.map((v) => {
              const isActive = activePreviewType === v.type;
              const simulatedHexes = colors.map((c) => simulateColorBlindness(c, v.type));
              const warnings = getConfusionWarnings(v.type);

              return (
                <div
                  key={v.type}
                  onClick={() => setActivePreviewType(v.type)}
                  className={`bg-white rounded-2xl border transition-all p-4 cursor-pointer space-y-3 ${
                    isActive
                      ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-sm'
                      : 'border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">
                        {v.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {v.prevalence}
                      </span>
                    </div>

                    {warnings.length > 0 ? (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>{warnings.length} Confusion Warning{warnings.length > 1 ? 's' : ''}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Distinct Contrast Pass</span>
                      </span>
                    )}
                  </div>

                  {/* 5-Color Swatch Strip for this deficiency */}
                  <div className="h-10 rounded-xl overflow-hidden flex border border-neutral-200/60">
                    {simulatedHexes.map((hex, idx) => {
                      const copyId = `${v.type}-${idx}`;
                      const isCopied = copiedKey === copyId;
                      const cInfo = getColorDetails(hex);

                      return (
                        <div
                          key={idx}
                          style={{ backgroundColor: hex }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(hex, copyId);
                          }}
                          className="flex-1 h-full relative group/slot flex items-center justify-center p-1 hover:flex-[1.5] transition-all cursor-pointer"
                          title={`Original: ${colors[idx]} → Simulated: ${hex}`}
                        >
                          <span
                            className={`text-[9px] font-mono font-bold px-1 rounded opacity-0 group-hover/slot:opacity-100 transition-opacity shadow-2xs truncate ${
                              cInfo.isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-neutral-900'
                            }`}
                          >
                            {isCopied ? 'COPIED' : hex}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Deep Active Deficiency Breakdown & Live UI Mockup */}
        <div className="space-y-6">
          
          {/* Active Deficiency Info Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Active Audit Focus
              </span>
              <h4 className="text-lg font-bold text-neutral-900">
                {activeDeficiencyInfo.title}
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {activeDeficiencyInfo.description}
              </p>
            </div>

            {/* Confusion Analysis Alert */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 block mb-2">
                Cone Perception & Collision Analysis
              </span>

              {activeWarnings.length > 0 ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Potential Color Collision Detected</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      The following pairs have close chromatic proximity under {activeDeficiencyInfo.title}. Do not rely on color alone to communicate state.
                    </p>
                  </div>

                  {activeWarnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: w.c1 }} />
                          <span className="font-mono text-[11px]">{w.c1}</span>
                        </div>
                        <span className="text-neutral-400">vs</span>
                        <div className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: w.c2 }} />
                          <span className="font-mono text-[11px]">{w.c2}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Δ {w.distance}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-800">Excellent Distinction</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      All 5 shades maintain strong chromatic separation under {activeDeficiencyInfo.title}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Simulated UI Component Preview */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                <span>Simulated UI Component</span>
              </h4>
              <span className="text-[10px] font-mono text-neutral-400">
                {activeDeficiencyInfo.type}
              </span>
            </div>

            {/* Render mini card with simulated colors */}
            {(() => {
              const bgSim = simulateColorBlindness(colors[0] || '#FFFFFF', activePreviewType);
              const cardSim = simulateColorBlindness(colors[1] || '#F3F4F6', activePreviewType);
              const primarySim = simulateColorBlindness(colors[2] || '#3B82F6', activePreviewType);
              const accentSim = simulateColorBlindness(colors[3] || '#10B981', activePreviewType);
              const textSim = simulateColorBlindness(colors[4] || '#111827', activePreviewType);

              const pInfo = getColorDetails(primarySim);

              return (
                <div
                  className="rounded-2xl p-4 border border-neutral-200/80 space-y-3 transition-colors"
                  style={{ backgroundColor: bgSim }}
                >
                  <div
                    className="p-3.5 rounded-xl shadow-xs space-y-2.5"
                    style={{ backgroundColor: cardSim }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentSim }} />
                        <span className="text-xs font-bold" style={{ color: textSim }}>
                          Simulated Card
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: primarySim,
                          color: pInfo.isDark ? '#FFFFFF' : '#000000',
                        }}
                      >
                        Active
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed opacity-80" style={{ color: textSim }}>
                      Previewing how typography, badges, and primary action buttons render under {activeDeficiencyInfo.title}.
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        style={{
                          backgroundColor: primarySim,
                          color: pInfo.isDark ? '#FFFFFF' : '#000000',
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold shadow-2xs"
                      >
                        Action Button
                      </button>

                      <span className="text-[10px] font-mono font-bold" style={{ color: accentSim }}>
                        {accentSim}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Edit in Studio CTA */}
          <button
            onClick={() => setGeneratorPaletteFromColors(colors)}
            className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Open & Refine in Spacebar Studio</span>
          </button>

        </div>

      </div>

    </div>
  );
};
