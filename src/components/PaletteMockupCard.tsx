import React, { useState } from 'react';
import { Palette } from '../types';
import { usePalette } from '../context/PaletteContext';
import { Heart, Bookmark, Sparkles, Copy, Check, ArrowUpRight, TrendingUp } from 'lucide-react';
import { getColorDetails } from '../utils/colorUtils';

interface PaletteMockupCardProps {
  palette: Palette;
}

export const PaletteMockupCard: React.FC<PaletteMockupCardProps> = ({ palette }) => {
  const { 
    openPalette, 
    toggleLike, 
    likedPaletteIds, 
    savedPaletteIds, 
    toggleSave, 
    copyValue, 
    setGeneratorPaletteFromColors 
  } = usePalette();

  const isLiked = likedPaletteIds.includes(palette.id);
  const isSaved = savedPaletteIds.includes(palette.id);

  // Map colors to UI roles
  const c = palette.colors;
  const bg = c[0] || '#FFFFFF';
  const surface = c[1] || '#F3F4F6';
  const primary = c[2] || '#3B82F6';
  const secondary = c[3] || '#10B981';
  const accent = c[4] || '#F59E0B';

  const primaryInfo = getColorDetails(primary);

  return (
    <div
      id={`palette-mockup-${palette.id}`}
      onClick={() => openPalette(palette)}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Live Mockup Container */}
      <div 
        className="p-4 sm:p-5 relative overflow-hidden transition-colors border-b border-neutral-100"
        style={{ backgroundColor: bg }}
      >
        {/* Mockup Card Body */}
        <div 
          className="rounded-xl p-3.5 shadow-sm space-y-3 transition-transform group-hover:scale-[1.01]"
          style={{ backgroundColor: surface }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: accent }} 
              />
              <span 
                className="text-xs font-bold font-mono truncate"
                style={{ color: primary }}
              >
                {palette.name}
              </span>
            </div>

            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ 
                backgroundColor: primary, 
                color: primaryInfo.isDark ? '#FFFFFF' : '#000000' 
              }}
            >
              Live UI
            </span>
          </div>

          {/* Mini Mock Graph Bars */}
          <div className="flex items-end gap-1.5 h-12 pt-2 px-1">
            <div className="flex-1 rounded-t-sm" style={{ height: '40%', backgroundColor: secondary }} />
            <div className="flex-1 rounded-t-sm" style={{ height: '85%', backgroundColor: primary }} />
            <div className="flex-1 rounded-t-sm" style={{ height: '60%', backgroundColor: accent }} />
            <div className="flex-1 rounded-t-sm" style={{ height: '100%', backgroundColor: primary }} />
            <div className="flex-1 rounded-t-sm" style={{ height: '50%', backgroundColor: secondary }} />
          </div>

          {/* Action CTA Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyValue(primary, `Copied Primary ${primary}`, primary);
              }}
              style={{ 
                backgroundColor: primary, 
                color: primaryInfo.isDark ? '#FFFFFF' : '#000000' 
              }}
              className="px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <span>Button</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>

            <span className="text-[10px] font-mono opacity-70 truncate" style={{ color: primary }}>
              {primary}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Color Horizontal Swatch Bar */}
      <div className="h-6 w-full flex">
        {palette.colors.map((hex, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: hex }}
            onClick={(e) => {
              e.stopPropagation();
              copyValue(hex, `Copied ${hex}`, hex);
            }}
            title={hex}
            className="flex-1 h-full hover:flex-[1.5] transition-all cursor-pointer"
          />
        ))}
      </div>

      {/* Info & Footer */}
      <div className="p-3.5 bg-white flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
            {palette.name}
          </h4>
          <p className="text-[11px] text-neutral-400 capitalize truncate">
            {palette.category} • {palette.colors.length} shades
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => toggleLike(palette.id, e)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              isLiked ? 'text-rose-600 bg-rose-50' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span>{palette.likes}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setGeneratorPaletteFromColors(palette.colors);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
            title="Edit in Spacebar Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
