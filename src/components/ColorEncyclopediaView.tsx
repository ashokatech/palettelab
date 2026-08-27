import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import {
  getColorDetails,
  getDetailedShadesAndTints,
  getColorHarmonies,
  simulateColorBlindness,
  normalizeHex,
} from '../utils/colorUtils';
import { ColorBlindnessType } from '../types';
import { PaletteCard } from './PaletteCard';
import {
  Search,
  Copy,
  Sparkles,
  ArrowLeft,
  Check,
  Eye,
  Layers,
  Code,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const ColorEncyclopediaView: React.FC = () => {
  const {
    selectedHex,
    openColorDetail,
    copyValue,
    palettes,
    setGeneratorPaletteFromColors,
    closePalette,
  } = usePalette();

  const [inputHex, setInputHex] = useState(selectedHex);
  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'scss'>('css');
  const [stepCount, setStepCount] = useState<10 | 20>(10);

  const info = getColorDetails(selectedHex);
  const { tints, shades, tones } = getDetailedShadesAndTints(selectedHex, stepCount);
  const harmonies = getColorHarmonies(selectedHex);

  const colorBlindnessList: { type: ColorBlindnessType; name: string; desc: string }[] = [
    { type: 'normal', name: 'Normal Vision', desc: 'Trichromat (100% cones)' },
    { type: 'protanopia', name: 'Protanopia', desc: 'Red-blind (0% L-cones)' },
    { type: 'protanomaly', name: 'Protanomaly', desc: 'Red-weak (low L-cones)' },
    { type: 'deuteranopia', name: 'Deuteranopia', desc: 'Green-blind (0% M-cones)' },
    { type: 'deuteranomaly', name: 'Deuteranomaly', desc: 'Green-weak (low M-cones)' },
    { type: 'tritanopia', name: 'Tritanopia', desc: 'Blue-blind (0% S-cones)' },
    { type: 'tritanomaly', name: 'Tritanomaly', desc: 'Blue-weak (low S-cones)' },
    { type: 'achromatopsia', name: 'Achromatopsia', desc: 'Monochromacy (Total)' },
  ];

  // Find related palettes from catalog that use this hex or similar tone
  const relatedPalettes = palettes
    .filter((p) =>
      p.colors.some(
        (c) => c.toLowerCase() === selectedHex.toLowerCase() || Math.abs(c.localeCompare(selectedHex)) < 3
      )
    )
    .slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputHex) {
      openColorDetail(inputHex);
    }
  };

  const quickPopularColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#264653',
    '#E76F51',
    '#0F172A',
  ];

  return (
    <div id="color-encyclopedia-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={closePalette}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        {/* Hex Search & Color Picker */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="color"
              value={selectedHex}
              onChange={(e) => {
                setInputHex(e.target.value);
                openColorDetail(e.target.value);
              }}
              className="w-9 h-9 rounded-xl border border-neutral-300 cursor-pointer p-0.5 mr-2 bg-white"
              title="Pick any color"
            />
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">
                #
              </span>
              <input
                type="text"
                value={inputHex.replace('#', '')}
                onChange={(e) => setInputHex(e.target.value)}
                placeholder="3B82F6 or color name"
                className="pl-7 pr-4 py-2 w-44 sm:w-56 rounded-xl border border-neutral-300 text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Quick Swatches Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-neutral-200 pb-4">
        <span className="text-xs font-semibold text-neutral-500 mr-2">Popular Colors:</span>
        {quickPopularColors.map((hex) => (
          <button
            key={hex}
            onClick={() => {
              setInputHex(hex);
              openColorDetail(hex);
            }}
            className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 shadow-2xs ${
              selectedHex.toUpperCase() === hex.toUpperCase() ? 'ring-2 ring-neutral-900 ring-offset-2' : 'border-neutral-200'
            }`}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>

      {/* Dominant Hero Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Color Swatch Hero */}
        <div
          className="lg:col-span-5 min-h-[280px] sm:min-h-[360px] p-8 flex flex-col justify-between relative transition-colors duration-300"
          style={{ backgroundColor: selectedHex }}
        >
          <div className="flex justify-between items-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider backdrop-blur-md ${
                info.isDark ? 'bg-black/30 text-white' : 'bg-white/70 text-neutral-900'
              }`}
            >
              {info.isDark ? 'Dark Color' : 'Light Color'}
            </span>
            <button
              onClick={() => copyValue(selectedHex, `Copied ${selectedHex}`, selectedHex)}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 ${
                info.isDark ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-white/80 text-neutral-900 hover:bg-white'
              }`}
              title="Copy HEX Code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                info.isDark ? 'text-white' : 'text-neutral-900'
              }`}
            >
              {info.name}
            </h1>
            <p
              className={`text-2xl sm:text-3xl font-mono font-bold tracking-wider ${
                info.isDark ? 'text-white/90' : 'text-neutral-900/90'
              }`}
            >
              {info.hex}
            </p>
          </div>
        </div>

        {/* Right Color Spaces Breakdown */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Color Spaces & Conversions</h2>
            <p className="text-xs text-neutral-500">
              Precise representation across web, print, and screen color models.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            
            {/* RGB */}
            <div
              onClick={() => copyValue(`rgb(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`, 'Copied RGB value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>RGB</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.rgb.r}, {info.rgb.g}, {info.rgb.b}
              </p>
              <span className="text-[10px] text-neutral-400 font-mono">
                {Math.round((info.rgb.r / 255) * 100)}%, {Math.round((info.rgb.g / 255) * 100)}%, {Math.round((info.rgb.b / 255) * 100)}%
              </span>
            </div>

            {/* HSL */}
            <div
              onClick={() => copyValue(`hsl(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`, 'Copied HSL value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>HSL</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.hsl.h}°, {info.hsl.s}%, {info.hsl.l}%
              </p>
              <span className="text-[10px] text-neutral-400">Hue, Sat, Light</span>
            </div>

            {/* HSV */}
            <div
              onClick={() => copyValue(`hsv(${info.hsv.h}, ${info.hsv.s}%, ${info.hsv.v}%)`, 'Copied HSV value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>HSV / HSB</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.hsv.h}°, {info.hsv.s}%, {info.hsv.v}%
              </p>
              <span className="text-[10px] text-neutral-400">Hue, Sat, Value</span>
            </div>

            {/* CMYK */}
            <div
              onClick={() => copyValue(`cmyk(${info.cmyk.c}%, ${info.cmyk.m}%, ${info.cmyk.y}%, ${info.cmyk.k}%)`, 'Copied CMYK value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>CMYK (Print)</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.cmyk.c}, {info.cmyk.m}, {info.cmyk.y}, {info.cmyk.k}
              </p>
              <span className="text-[10px] text-neutral-400">Cyan, Mag, Yel, Key</span>
            </div>

            {/* CIE-LAB */}
            <div
              onClick={() => copyValue(`lab(${info.lab.l}% ${info.lab.a} ${info.lab.b})`, 'Copied CIE-LAB value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>CIE-LAB</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.lab.l}, {info.lab.a}, {info.lab.b}
              </p>
              <span className="text-[10px] text-neutral-400">Perceptual Space</span>
            </div>

            {/* XYZ */}
            <div
              onClick={() => copyValue(`xyz(${info.xyz.x}, ${info.xyz.y}, ${info.xyz.z})`, 'Copied XYZ value')}
              className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>CIE-XYZ</span>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-neutral-400" />
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">
                {info.xyz.x}, {info.xyz.y}, {info.xyz.z}
              </p>
              <span className="text-[10px] text-neutral-400">D65 Illuminant</span>
            </div>

          </div>

          {/* Quick Contrast Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700">WCAG Ratio:</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono font-bold text-neutral-800">
                {info.contrastWithWhite}:1 on White
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono font-bold text-neutral-800">
                {info.contrastWithBlack}:1 on Black
              </span>
            </div>

            <button
              onClick={() => setGeneratorPaletteFromColors([selectedHex, ...harmonies.triadic.slice(1)])}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open in Generator</span>
            </button>
          </div>

        </div>
      </div>

      {/* Shades, Tints, and Tones (Color-Hex.com Specialty) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Shades, Tints & Tone Scales</h2>
            <p className="text-xs text-neutral-500">
              Explore step-by-step variations mixed with white (tints), black (shades), and neutral gray (tones).
            </p>
          </div>

          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
            <button
              onClick={() => setStepCount(10)}
              className={`px-3 py-1 rounded-lg ${stepCount === 10 ? 'bg-white text-neutral-900 shadow-2xs' : ''}`}
            >
              10 Steps
            </button>
            <button
              onClick={() => setStepCount(20)}
              className={`px-3 py-1 rounded-lg ${stepCount === 20 ? 'bg-white text-neutral-900 shadow-2xs' : ''}`}
            >
              20 Steps
            </button>
          </div>
        </div>

        {/* Tints Scale (Adding White) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-neutral-700">
            <span>Tints (Mixed with #FFFFFF)</span>
            <span className="text-neutral-400 font-normal">Click any swatch to copy or inspect</span>
          </div>
          <div className="h-14 rounded-2xl overflow-hidden flex border border-neutral-200 shadow-xs">
            {tints.map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: item.hex }}
                onClick={() => {
                  copyValue(item.hex, `Copied Tint ${item.hex}`, item.hex);
                  openColorDetail(item.hex);
                }}
                className="flex-1 h-full cursor-pointer relative group transition-all hover:flex-[2] flex items-center justify-center"
                title={`${item.hex} (+${item.percent}% white)`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                  {item.hex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shades Scale (Adding Black) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-neutral-700">
            <span>Shades (Mixed with #000000)</span>
            <span className="text-neutral-400 font-normal">Darker variations</span>
          </div>
          <div className="h-14 rounded-2xl overflow-hidden flex border border-neutral-200 shadow-xs">
            {shades.map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: item.hex }}
                onClick={() => {
                  copyValue(item.hex, `Copied Shade ${item.hex}`, item.hex);
                  openColorDetail(item.hex);
                }}
                className="flex-1 h-full cursor-pointer relative group transition-all hover:flex-[2] flex items-center justify-center"
                title={`${item.hex} (+${item.percent}% black)`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                  {item.hex}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tones Scale (Adding Neutral Gray #808080) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-neutral-700">
            <span>Tones (Desaturated with #808080)</span>
            <span className="text-neutral-400 font-normal">Muted variations</span>
          </div>
          <div className="h-14 rounded-2xl overflow-hidden flex border border-neutral-200 shadow-xs">
            {tones.map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: item.hex }}
                onClick={() => {
                  copyValue(item.hex, `Copied Tone ${item.hex}`, item.hex);
                  openColorDetail(item.hex);
                }}
                className="flex-1 h-full cursor-pointer relative group transition-all hover:flex-[2] flex items-center justify-center"
                title={`${item.hex} (+${item.percent}% gray)`}
              >
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                  {item.hex}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Color Harmonies & Classic Schemes (Color-Hex Style) */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Harmonic Color Schemes</h2>
          <p className="text-xs text-neutral-500">
            Color wheel geometric harmonies constructed around {info.name} ({info.hex}).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Complementary */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Complementary (180°)</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.complementary)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.complementary.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Triadic */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Triadic (120°)</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.triadic)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.triadic.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analogous */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Analogous (±30°)</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.analogous)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.analogous.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tetradic / Rectangle */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Tetradic (Rectangle)</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.tetradic)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.tetradic.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Square */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Square (90°)</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.square)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.square.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monochromatic */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">Monochromatic</span>
              <button
                onClick={() => setGeneratorPaletteFromColors(harmonies.monochromatic)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Edit</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="h-16 rounded-xl overflow-hidden flex border border-neutral-200">
              {harmonies.monochromatic.map((hex, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: hex }}
                  onClick={() => openColorDetail(hex)}
                  className="flex-1 h-full cursor-pointer hover:opacity-90 flex items-end p-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow-xs bg-black/40 px-1 rounded">
                    {hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Color Blindness Simulation Matrix */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Color Blindness Simulation</h2>
          <p className="text-xs text-neutral-500">
            How this specific color is perceived by individuals with various types of color vision deficiencies.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colorBlindnessList.map((cb) => {
            const simHex = simulateColorBlindness(selectedHex, cb.type);
            return (
              <div
                key={cb.type}
                onClick={() => copyValue(simHex, `Copied ${cb.name} (${simHex})`, simHex)}
                className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 space-y-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div
                  className="h-16 rounded-xl border border-neutral-300/60 shadow-inner flex items-end p-2"
                  style={{ backgroundColor: simHex }}
                >
                  <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {simHex}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{cb.name}</h4>
                  <p className="text-[11px] text-neutral-500">{cb.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Snippets Box */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-neutral-900">CSS & Web Implementation</h2>
          </div>

          <div className="flex items-center gap-1">
            {(['css', 'tailwind', 'scss'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                  activeTab === tab ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-neutral-900 text-neutral-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto">
          <pre>
            {activeTab === 'css' &&
              `/* CSS Declarations for ${info.name} */\n.color-sample {\n  color: ${info.hex};\n  background-color: ${info.hex};\n  border-color: ${info.hex};\n  box-shadow: 0 10px 25px -5px ${info.hex}40;\n}`}
            {activeTab === 'tailwind' &&
              `// Tailwind Class Reference\nbg-[${info.hex}] text-[${info.hex}] border-[${info.hex}] ring-[${info.hex}]`}
            {activeTab === 'scss' &&
              `// SCSS Variables\n$color-primary: ${info.hex};\n$color-primary-rgb: (${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b});\n$color-primary-hsl: (${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%);`}
          </pre>

          <button
            onClick={() => {
              const text =
                activeTab === 'css'
                  ? `background-color: ${info.hex}; color: ${info.hex};`
                  : activeTab === 'tailwind'
                  ? `bg-[${info.hex}] text-[${info.hex}]`
                  : `$color-primary: ${info.hex};`;
              copyValue(text, 'Copied Code snippet');
            }}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 border border-neutral-700"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Related Palettes from Catalog */}
      {relatedPalettes.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-neutral-900">
              Palettes featuring {info.name}
            </h2>
            <span className="text-xs text-neutral-500">From our curated collection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPalettes.map((p) => (
              <PaletteCard key={p.id} palette={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
