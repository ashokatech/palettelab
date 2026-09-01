import React, { useState, useRef } from 'react';
import { usePalette } from '../context/PaletteContext';
import { ToolSubTab } from '../types';
import { ImageExtractorView } from './ImageExtractorView';
import { ColorBlindnessView } from './ColorBlindnessView';
import { BrandColorsView } from './BrandColorsView';
import { generateSemanticPalette } from '../utils/semanticColorEngine';
import {
  getContrastRatio,
  getColorDetails,
  normalizeHex,
  rgbToHex,
  hexToRgb,
} from '../utils/colorUtils';
import {
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Sparkles,
  Copy,
  Layers,
  Sliders,
  ArrowRightLeft,
  Upload,
  RefreshCw,
  Eye,
  Laptop,
  Smartphone,
  ShoppingBag,
  Briefcase,
  Sun,
  Moon,
  Palette as PaletteIcon,
} from 'lucide-react';

export const ToolsView: React.FC = () => {
  const {
    toolSubTab,
    setToolSubTab,
    copyValue,
    showToast,
    setGeneratorPaletteFromColors,
    saveNewPalette,
    palettes,
    generatorSlots,
  } = usePalette();

  // -------------------------------------------------------------
  // Tool 2: WCAG Contrast Checker State
  // -------------------------------------------------------------
  const [fgColor, setFgColor] = useState('#1E293B');
  const [bgColor, setBgColor] = useState('#F8FAFC');
  const [matrixPalette, setMatrixPalette] = useState<string[]>([
    '#0F172A',
    '#2563EB',
    '#10B981',
    '#F59E0B',
    '#FFFFFF',
  ]);

  const contrast = getContrastRatio(fgColor, bgColor);
  const aaNormal = contrast >= 4.5;
  const aaLarge = contrast >= 3.0;
  const aaaNormal = contrast >= 7.0;
  const aaaLarge = contrast >= 4.5;
  const graphical = contrast >= 3.0;

  const handleSwapContrast = () => {
    setFgColor(bgColor);
    setBgColor(fgColor);
  };

  // -------------------------------------------------------------
  // Tool 3: CSS Gradient Studio State
  // -------------------------------------------------------------
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradColors, setGradColors] = useState<{ hex: string; stop: number }[]>([
    { hex: '#4F46E5', stop: 0 },
    { hex: '#06B6D4', stop: 50 },
    { hex: '#10B981', stop: 100 },
  ]);

  const getGradientCss = () => {
    const stopsStr = gradColors.map((c) => `${c.hex} ${c.stop}%`).join(', ');
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${stopsStr})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle at center, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${gradientAngle}deg at 50% 50%, ${stopsStr})`;
    }
  };

  const getTailwindGradient = () => {
    if (gradientType === 'linear') {
      const dirMap: Record<number,string> = {0:'to-t',45:'to-tr',90:'to-r',135:'to-br',180:'to-b',225:'to-bl',270:'to-l',315:'to-tl'};
      const closest = Object.keys(dirMap).map(Number).reduce((p,c)=> Math.abs(c-gradientAngle) < Math.abs(p-gradientAngle) ? c : p, 90);
      const dir = dirMap[closest] || 'to-r';
      if (gradColors.length===2) return `bg-gradient-${dir} from-[${gradColors[0].hex}] to-[${gradColors[1].hex}]`;
      if (gradColors.length===3) return `bg-gradient-${dir} from-[${gradColors[0].hex}] via-[${gradColors[1].hex}] to-[${gradColors[2].hex}]`;
      return `bg-[linear-gradient(${gradientAngle}deg,${gradColors.map(c=>`${c.hex} ${c.stop}%`).join(',')})]`;
    }
    if (gradientType==='radial') return `bg-[radial-gradient(circle_at_center,${gradColors.map(c=>`${c.hex} ${c.stop}%`).join(',')})]`;
    return `bg-[conic-gradient(from_${gradientAngle}deg_at_50%_50%,${gradColors.map(c=>`${c.hex} ${c.stop}%`).join(',')})]`;
  };

  const [gradCodeTab, setGradCodeTab] = useState<'css'|'tailwind'>('css');

  const gradientPresets = [
    {
      name: 'Sunset Mirage',
      type: 'linear' as const,
      angle: 135,
      colors: [
        { hex: '#FF6B6B', stop: 0 },
        { hex: '#FFA07A', stop: 50 },
        { hex: '#FFE66D', stop: 100 },
      ],
    },
    {
      name: 'Cyberpunk Neon',
      type: 'linear' as const,
      angle: 90,
      colors: [
        { hex: '#EC4899', stop: 0 },
        { hex: '#8B5CF6', stop: 50 },
        { hex: '#3B82F6', stop: 100 },
      ],
    },
    {
      name: 'Emerald Aurora',
      type: 'linear' as const,
      angle: 120,
      colors: [
        { hex: '#047857', stop: 0 },
        { hex: '#10B981', stop: 50 },
        { hex: '#6EE7B7', stop: 100 },
      ],
    },
    {
      name: 'Deep Oceanic',
      type: 'radial' as const,
      angle: 0,
      colors: [
        { hex: '#1E3A8A', stop: 0 },
        { hex: '#0F172A', stop: 100 },
      ],
    },
  ];

  // -------------------------------------------------------------
  // Tool 4: Live UI Mockup Previewer State
  // -------------------------------------------------------------
  const [uiMockPalette, setUiMockPalette] = useState<string[]>([
    '#2563EB',
    '#1E293B',
    '#F8FAFC',
    '#10B981',
    '#F59E0B',
  ]);
  const [uiDark, setUiDark] = useState(false);
  const [uiView, setUiView] = useState<'saas' | 'mobile' | 'ecommerce' | 'portfolio'>('saas');

  // -------------------------------------------------------------
  // Tool 5: AI Prompt to Palette State
  // -------------------------------------------------------------
  const [aiPrompt, setAiPrompt] = useState('Cyberpunk Tokyo Neon Rain');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    name: string;
    colors: string[];
    description: string;
    category: string;
    tags: string[];
  }>({
    name: 'Cyberpunk Tokyo Neon Rain',
    colors: ['#0A0E17', '#1A2238', '#FF0055', '#00FFFF', '#FFE600'],
    description: 'Electric high-contrast palette pairing deep midnight chassis with vibrant neon magenta and cyan highlights.',
    category: 'Vibrant',
    tags: ['cyberpunk', 'neon', 'futuristic'],
  });

  const promptSuggestions = [
    'Organic Matcha Green Bakery',
    'Nordic Deep Fjord Cabin',
    'Fintech Trust & High Security',
    'Sunset in Santorini Coast',
    'Minimalist Bauhaus Architecture',
    'Retro 1980s Arcade Synth',
  ];

  const handleGenerateAiPalette = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/generate-ai-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, count: 5 }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.colors) {
          setAiResult(data);
          showToast({ type: 'success', title: 'Semantic Palette Synthesized!' });
          setAiLoading(false);
          return;
        }
      }
    } catch (err) {
      // Fallback for static client hosting
    }

    // Direct sub-1ms client-side semantic color generation
    const localResult = generateSemanticPalette(aiPrompt, 5);
    setAiResult(localResult);
    showToast({ type: 'success', title: 'Semantic Palette Synthesized!' });
    setAiLoading(false);
  };

  return (
    <div id="advanced-tools-suite" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Tool Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Design & Color Tools Suite
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Industry-grade color extraction, accessibility audits, gradient builder, and UI mockup simulators.
          </p>
        </div>

        {/* Active tool breadcrumb — header rail is now the nav, no duplicate pills */}
        <div className="text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700 capitalize">{toolSubTab.replace('-',' ')}</span> <span className="text-neutral-400">• Use the tools rail above to switch</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. IMAGE TO PALETTE EXTRACTOR                             */}
      {/* ========================================================= */}
      {toolSubTab === 'image-extractor' && <ImageExtractorView />}

      {/* ========================================================= */}
      {/* 2. WCAG & APCA CONTRAST CHECKER                           */}
      {/* ========================================================= */}
      {toolSubTab === 'contrast-checker' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">WCAG 2.1 Color Contrast Matrix</h2>
              <p className="text-xs text-neutral-500">
                Verify text legibility and accessibility conformance against W3C Level AA and AAA standards.
              </p>
            </div>

            <button
              onClick={handleSwapContrast}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap Colors</span>
            </button>
          </div>

          {/* Color Pickers & Ratio Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Foreground */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <label className="text-xs font-bold text-neutral-700">Text (Foreground)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 font-mono text-xs uppercase font-bold outline-none"
                />
              </div>
            </div>

            {/* Score Pill */}
            <div className="md:col-span-4 text-center space-y-1 p-4 rounded-2xl bg-neutral-900 text-white shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                Contrast Ratio
              </span>
              <p className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {contrast}:1
              </p>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  aaNormal ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {aaNormal ? 'Passes WCAG AA' : 'Fails WCAG AA'}
              </span>
            </div>

            {/* Background */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <label className="text-xs font-bold text-neutral-700">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 font-mono text-xs uppercase font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Compliance Matrix Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* AA Normal */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">WCAG AA Normal</span>
                {aaNormal ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-xs text-neutral-500">Requires 4.5:1 ratio</p>
              <span className={`text-xs font-bold ${aaNormal ? 'text-emerald-600' : 'text-rose-500'}`}>
                {aaNormal ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* AA Large */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">WCAG AA Large</span>
                {aaLarge ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-xs text-neutral-500">Requires 3.0:1 ratio (18pt+)</p>
              <span className={`text-xs font-bold ${aaLarge ? 'text-emerald-600' : 'text-rose-500'}`}>
                {aaLarge ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* AAA Normal */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">WCAG AAA Normal</span>
                {aaaNormal ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-xs text-neutral-500">Requires 7.0:1 ratio</p>
              <span className={`text-xs font-bold ${aaaNormal ? 'text-emerald-600' : 'text-rose-500'}`}>
                {aaaNormal ? 'PASS' : 'FAIL'}
              </span>
            </div>

            {/* Graphical UI */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">UI Components</span>
                {graphical ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
              <p className="text-xs text-neutral-500">Borders & Icons (3.0:1)</p>
              <span className={`text-xs font-bold ${graphical ? 'text-emerald-600' : 'text-rose-500'}`}>
                {graphical ? 'PASS' : 'FAIL'}
              </span>
            </div>

          </div>

          {/* Live Interactive UI Rendering Sandbox */}
          <div
            className="p-8 rounded-2xl border border-neutral-300 shadow-inner space-y-4 transition-colors"
            style={{ backgroundColor: bgColor, color: fgColor }}
          >
            <span className="text-xs font-mono font-bold tracking-wider opacity-75 uppercase">
              Live Preview Component
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              The quick brown fox jumps over the lazy dog
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-90 max-w-2xl">
              Consistent contrast ensures your digital products are legible for people with low
              vision or color vision deficiencies, while reducing ocular fatigue in harsh ambient
              lighting conditions.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                style={{ backgroundColor: fgColor, color: bgColor }}
                className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
              >
                Solid Action Button
              </button>
              <button
                style={{ borderColor: fgColor, color: fgColor }}
                className="px-4 py-2 rounded-xl border text-xs font-bold bg-transparent"
              >
                Outlined Secondary
              </button>
            </div>
          </div>

          {/* 5x5 Pairwise Palette Contrast Grid Matrix */}
          <div className="pt-6 border-t border-neutral-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Palette Pairwise Contrast Matrix (5x5)
                </h3>
                <p className="text-xs text-neutral-500">
                  Instant W3C contrast ratio between every combination of colors in your palette.
                </p>
              </div>

              <button
                onClick={() => {
                  const randomPal = palettes[Math.floor(Math.random() * palettes.length)];
                  if (randomPal) setMatrixPalette(randomPal.colors.slice(0, 5));
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Random Palette</span>
              </button>
            </div>

            {/* Editable Swatches Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {matrixPalette.map((hex, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200"
                >
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => {
                      const next = [...matrixPalette];
                      next[idx] = e.target.value;
                      setMatrixPalette(next);
                    }}
                    className="w-7 h-7 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={hex.toUpperCase()}
                    onChange={(e) => {
                      const next = [...matrixPalette];
                      next[idx] = e.target.value;
                      setMatrixPalette(next);
                    }}
                    className="w-full text-xs font-mono font-bold text-neutral-800 uppercase outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200">
                    <th className="p-3 font-semibold text-neutral-500">Text ↓ / Bg →</th>
                    {matrixPalette.map((colHex, cIdx) => (
                      <th key={cIdx} className="p-2.5 text-center min-w-[90px]">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: colHex }}
                          />
                          <span className="font-mono text-[10px]">{colHex}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {matrixPalette.map((rowHex, rIdx) => (
                    <tr key={rIdx} className="hover:bg-neutral-50/50">
                      <td className="p-2.5 font-bold font-mono text-neutral-700 bg-neutral-50/70 border-r border-neutral-200">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: rowHex }}
                          />
                          <span>{rowHex}</span>
                        </div>
                      </td>

                      {matrixPalette.map((colHex, cIdx) => {
                        const cellRatio = getContrastRatio(rowHex, colHex);
                        const isSelf = rIdx === cIdx;
                        const isAALarge = cellRatio >= 3.0;
                        const isAANormal = cellRatio >= 4.5;
                        const isAAA = cellRatio >= 7.0;

                        return (
                          <td
                            key={cIdx}
                            onClick={() => {
                              if (!isSelf) {
                                setFgColor(rowHex);
                                setBgColor(colHex);
                                showToast({
                                  type: 'info',
                                  title: `Testing ${rowHex} on ${colHex} (${cellRatio}:1)`,
                                });
                              }
                            }}
                            className={`p-2.5 text-center cursor-pointer transition-colors ${
                              isSelf
                                ? 'bg-neutral-100/50 text-neutral-300'
                                : 'hover:bg-indigo-50/60'
                            }`}
                            title={isSelf ? 'Identical colors' : `Click to test in sandbox`}
                          >
                            {isSelf ? (
                              <span className="font-mono text-neutral-300">—</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono font-bold text-neutral-900">
                                  {cellRatio}:1
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                    isAAA
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isAANormal
                                      ? 'bg-teal-100 text-teal-800'
                                      : isAALarge
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {isAAA ? 'AAA' : isAANormal ? 'AA' : isAALarge ? 'AA-Lg' : 'Fail'}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CSS GRADIENT STUDIO                                    */}
      {/* ========================================================= */}
      {toolSubTab === 'gradient-maker' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">CSS Gradient Studio</h2>
              <p className="text-xs text-neutral-500">
                Design fluid multi-stop linear, radial, and conic gradients with instant CSS code generation.
              </p>
            </div>

            {/* Type selector */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
              {(['linear', 'radial', 'conic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setGradientType(t)}
                  className={`px-3 py-1.5 rounded-lg capitalize ${
                    gradientType === t ? 'bg-white text-neutral-900 shadow-xs' : ''
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Gradient Preview Box */}
            <div className="lg:col-span-6 space-y-4">
              <div
                className="h-64 sm:h-80 rounded-3xl border border-neutral-200 shadow-md flex items-end p-6 transition-all"
                style={{ background: getGradientCss() }}
              >
                <div className="bg-black/60 text-white backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono font-bold">
                  {gradientType.toUpperCase()} • {gradientAngle}°
                </div>
              </div>

              {/* Preset Gradients */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500">Curated Presets:</span>
                <div className="grid grid-cols-4 gap-2">
                  {gradientPresets.map((p, idx) => {
                    const stopsStr = p.colors.map((c) => `${c.hex} ${c.stop}%`).join(', ');
                    const bg = `linear-gradient(135deg, ${stopsStr})`;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setGradientType(p.type);
                          setGradientAngle(p.angle);
                          setGradColors(p.colors);
                        }}
                        style={{ background: bg }}
                        className="h-12 rounded-xl border border-neutral-200 hover:scale-105 transition-transform shadow-2xs"
                        title={p.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gradient Controls & Stops */}
            <div className="lg:col-span-6 space-y-6">
              {/* Angle Control */}
              {gradientType !== 'radial' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-700">
                    <span>Angle / Direction</span>
                    <span className="font-mono">{gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                  />
                </div>
              )}

              {/* Color Stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">Color Stops</label>
                  {gradColors.length < 5 && (
                    <button
                      onClick={() =>
                        setGradColors((prev) => [...prev, { hex: '#EC4899', stop: 75 }])
                      }
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      + Add Stop
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {gradColors.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50"
                    >
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGradColors((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, hex: val } : item))
                          );
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={c.hex}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGradColors((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, hex: val } : item))
                          );
                        }}
                        className="w-24 px-2 py-1 text-xs font-mono uppercase bg-white border border-neutral-300 rounded font-bold"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={c.stop}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setGradColors((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stop: val } : item))
                          );
                        }}
                        className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                      />
                      <span className="text-xs font-mono text-neutral-500 w-8">{c.stop}%</span>
                      {gradColors.length > 2 && (
                        <button
                          onClick={() => setGradColors((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-neutral-400 hover:text-rose-600 text-sm px-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-tool import — previously had to retype HEX manually */}
              <div className="flex gap-2">
                <button onClick={() => {
                  const rp = palettes[Math.floor(Math.random()*palettes.length)];
                  const gp = (rp?.colors || ['#4F46E5','#06B6D4','#10B981']).slice(0,5);
                  setGradColors(gp.map((hex,i)=>({hex, stop: Math.round(i*100/Math.max(1,gp.length-1))})))
                }} className="flex-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold">Load Random Palette</button>
                <button onClick={() => {
                  const gs = generatorSlots.map(s=>s.hex);
                  if (gs.length) setGradColors(gs.map((hex,i)=>({hex, stop: Math.round(i*100/Math.max(1,gs.length-1))})))
                }} className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold">From Generator</button>
              </div>

              {/* Code Snippet Box — now CSS + Tailwind + affiliate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-neutral-700">Code</label>
                  <div className="flex bg-neutral-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button onClick={()=>setGradCodeTab('css')} className={`px-2.5 py-1 rounded-md ${gradCodeTab==='css'?'bg-white shadow-xs text-neutral-900':'text-neutral-500'}`}>CSS</button>
                    <button onClick={()=>setGradCodeTab('tailwind')} className={`px-2.5 py-1 rounded-md ${gradCodeTab==='tailwind'?'bg-white shadow-xs text-neutral-900':'text-neutral-500'}`}>Tailwind</button>
                  </div>
                </div>
                <div className="relative bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <code>{gradCodeTab==='css' ? `background: ${getGradientCss()};` : getTailwindGradient()}</code>
                  <button
                    onClick={() => copyValue(gradCodeTab==='css' ? `background: ${getGradientCss()};` : getTailwindGradient(), gradCodeTab==='css' ? 'Copied Gradient CSS' : 'Copied Tailwind Gradient')}
                    className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 border border-neutral-700"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="flex gap-2 text-xs">
                  <a href="https://tailwindui.com/?ref=palettelab" target="_blank" rel="sponsored nofollow noopener" className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-center hover:bg-indigo-700">Get Tailwind UI (30% off via us)</a>
                  <a href="https://www.canva.com/join/?ref=palettelab" target="_blank" rel="sponsored nofollow noopener" className="px-4 py-2 rounded-xl bg-white border border-neutral-300 font-semibold hover:bg-neutral-50">Edit in Canva Pro</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LIVE UI MOCKUP PREVIEWER                               */}
      {/* ========================================================= */}
      {toolSubTab === 'ui-preview' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Live UI Mockup Simulator</h2>
              <p className="text-xs text-neutral-500">
                Preview your selected palette rendered dynamically across real web application interfaces.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark/Light mode toggle */}
              <button
                onClick={() => setUiDark(!uiDark)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {uiDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>{uiDark ? 'Light UI' : 'Dark UI'}</span>
              </button>

              {/* View layout selector */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
                <button
                  onClick={() => setUiView('saas')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                    uiView === 'saas' ? 'bg-white text-neutral-900 shadow-xs' : ''
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>SaaS</span>
                </button>
                <button
                  onClick={() => setUiView('mobile')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                    uiView === 'mobile' ? 'bg-white text-neutral-900 shadow-xs' : ''
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setUiView('ecommerce')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1 ${
                    uiView === 'ecommerce' ? 'bg-white text-neutral-900 shadow-xs' : ''
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Shop</span>
                </button>
              </div>
            </div>
          </div>

          {/* Palette Color Pickers for UI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-neutral-700">Active Theme Colors:</label>
              <button onClick={()=> setUiMockPalette(generatorSlots.map(s=>s.hex).slice(0,5))} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">From Generator</button>
              <button onClick={() => { const rp=palettes[Math.floor(Math.random()*palettes.length)]; if(rp) setUiMockPalette(rp.colors.slice(0,5)); }} className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-semibold">Random Palette</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {uiMockPalette.map((hex, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-neutral-200">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUiMockPalette((prev) =>
                        prev.map((c, i) => (i === idx ? val : c))
                      );
                    }}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Mock Rendered Container */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-lg transition-colors ${
              uiDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}
          >
            {uiView === 'saas' && (
              <div className="space-y-6">
                {/* Navbar */}
                <div
                  className="flex items-center justify-between p-4 rounded-2xl shadow-xs"
                  style={{ backgroundColor: uiMockPalette[1] || '#1E293B', color: '#FFFFFF' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                      style={{ backgroundColor: uiMockPalette[0] }}
                    >
                      PL
                    </div>
                    <span className="font-bold text-sm">Fintech Insights Dashboard</span>
                  </div>
                  <button
                    style={{ backgroundColor: uiMockPalette[0], color: '#FFFFFF' }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-90"
                  >
                    Upgrade Plan
                  </button>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    className="p-5 rounded-2xl border shadow-xs space-y-2"
                    style={{
                      backgroundColor: uiDark ? '#171717' : '#FFFFFF',
                      borderColor: uiDark ? '#262626' : '#E5E5E5',
                    }}
                  >
                    <span className="text-xs text-neutral-400 font-semibold">Total Revenue</span>
                    <p className="text-2xl font-extrabold" style={{ color: uiMockPalette[0] }}>
                      $128,490
                    </p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: `${uiMockPalette[3]}25`, color: uiMockPalette[3] }}
                    >
                      +18.4% this month
                    </span>
                  </div>

                  <div
                    className="p-5 rounded-2xl border shadow-xs space-y-2"
                    style={{
                      backgroundColor: uiDark ? '#171717' : '#FFFFFF',
                      borderColor: uiDark ? '#262626' : '#E5E5E5',
                    }}
                  >
                    <span className="text-xs text-neutral-400 font-semibold">Active Customers</span>
                    <p className="text-2xl font-extrabold" style={{ color: uiMockPalette[3] || uiMockPalette[0] }}>
                      14,892
                    </p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: `${uiMockPalette[0]}25`, color: uiMockPalette[0] }}
                    >
                      +410 new today
                    </span>
                  </div>

                  <div
                    className="p-5 rounded-2xl border shadow-xs space-y-2"
                    style={{
                      backgroundColor: uiDark ? '#171717' : '#FFFFFF',
                      borderColor: uiDark ? '#262626' : '#E5E5E5',
                    }}
                  >
                    <span className="text-xs text-neutral-400 font-semibold">Conversion Rate</span>
                    <p className="text-2xl font-extrabold" style={{ color: uiMockPalette[4] || uiMockPalette[0] }}>
                      4.82%
                    </p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: `${uiMockPalette[4]}25`, color: uiMockPalette[4] }}
                    >
                      Top 5% industry
                    </span>
                  </div>
                </div>
              </div>
            )}

            {uiView === 'mobile' && (
              <div className="max-w-xs mx-auto rounded-3xl p-6 shadow-2xl border border-neutral-200/40 space-y-5" style={{ backgroundColor: uiDark ? '#121212' : '#FFFFFF' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-400">9:41 AM</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: uiMockPalette[3] }} />
                </div>
                <div
                  className="p-5 rounded-2xl text-white space-y-2 shadow-md"
                  style={{ backgroundColor: uiMockPalette[0] }}
                >
                  <p className="text-xs opacity-80">Debit Card</p>
                  <p className="text-xl font-mono font-bold tracking-wider">**** 4920</p>
                  <p className="text-lg font-bold">$24,930.00</p>
                </div>
                <button
                  style={{ backgroundColor: uiMockPalette[1], color: '#FFFFFF' }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs"
                >
                  Send Money Instantly
                </button>
              </div>
            )}

            {uiView === 'ecommerce' && (
              <div className="max-w-md mx-auto rounded-2xl border p-6 space-y-4 shadow-sm" style={{ backgroundColor: uiDark ? '#171717' : '#FFFFFF' }}>
                <div
                  className="h-44 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                  style={{ backgroundColor: uiMockPalette[0] }}
                >
                  Premium Audio Headphones
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: uiMockPalette[4] }}>
                    Flagship Series
                  </span>
                  <h4 className="text-lg font-bold">Studio Wireless Noise-Cancelling</h4>
                  <p className="text-xl font-mono font-extrabold" style={{ color: uiMockPalette[0] }}>
                    $299.00
                  </p>
                </div>
                <button
                  style={{ backgroundColor: uiMockPalette[3] || uiMockPalette[0], color: '#FFFFFF' }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. AI PROMPT TO PALETTE STUDIO                            */}
      {/* ========================================================= */}
      {toolSubTab === 'ai-studio' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Semantic Prompt to Palette Studio</h2>
              <p className="text-xs text-neutral-500">
                100% local math — describe any mood, concept, or atmosphere to synthesize a coherent color scheme. No API key, zero cost, instant.
              </p>
            </div>
          </div>

          {/* Search Prompt Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateAiPalette();
                }}
                placeholder="e.g. Cozy Scandinavian Bakery or Cyberpunk Tokyo"
                className="flex-1 px-4 py-3 rounded-2xl border border-neutral-300 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-600 outline-none"
              />
              <button
                onClick={handleGenerateAiPalette}
                disabled={aiLoading}
                className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                )}
                <span>{aiLoading ? 'Generating...' : 'Generate Palette'}</span>
              </button>
            </div>

            {/* Prompt chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-semibold text-neutral-400 mr-1">Suggestions:</span>
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAiPrompt(s);
                  }}
                  className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {aiResult && (
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                    {aiResult.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{aiResult.name}</h3>
                  <p className="text-xs text-neutral-600 mt-1 max-w-xl">{aiResult.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      saveNewPalette(aiResult.name, aiResult.colors, aiResult.category, aiResult.tags);
                      showToast({ type: 'success', title: 'Saved AI Palette to Library!' });
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-semibold text-xs transition-colors"
                  >
                    Save Palette
                  </button>
                  <button
                    onClick={() => setGeneratorPaletteFromColors(aiResult.colors)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open in Generator</span>
                  </button>
                </div>
              </div>

              {/* Dominant Palette Bars */}
              <div className="h-28 rounded-2xl overflow-hidden flex border border-neutral-200 shadow-sm">
                {aiResult.colors.map((hex, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: hex }}
                    onClick={() => copyValue(hex, `Copied ${hex}`, hex)}
                    className="flex-1 h-full cursor-pointer hover:flex-[1.5] transition-all flex flex-col justify-end p-2.5 group"
                  >
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-xs text-center">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. COLOR BLINDNESS SIMULATOR & AUDITOR                    */}
      {/* ========================================================= */}
      {toolSubTab === 'color-blindness' && <ColorBlindnessView />}

      {/* ========================================================= */}
      {/* 7. TECH & BRAND DESIGN TOKENS DIRECTORY                   */}
      {/* ========================================================= */}
      {toolSubTab === 'brand-colors' && <BrandColorsView />}

    </div>
  );
};
