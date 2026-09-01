import React, { useState } from 'react';
import { Palette } from '../types';
import { usePalette } from '../context/PaletteContext';
import { Heart, Copy, Share2, Sparkles, Check, Bookmark } from 'lucide-react';
import { getColorDetails } from '../utils/colorUtils';

interface PaletteCardProps {
  palette: Palette;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette }) => {
  const { 
    openPalette, 
    toggleLike, 
    likedPaletteIds, 
    copyValue, 
    showToast,
    setGeneratorPaletteFromColors,
    savedPaletteIds,
    toggleSave
  } = usePalette();

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const isLiked = likedPaletteIds.includes(palette.id);
  const isSaved = savedPaletteIds.includes(palette.id);

  const handleColorClick = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    copyValue(hex, `Copied ${hex}`, hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleCopyPaletteHexes = (e: React.MouseEvent) => {
    e.stopPropagation();
    const hexList = palette.colors.join(', ');
    copyValue(hexList, 'Copied all HEX codes', palette.colors[0]);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?tab=palette-detail&palette=${palette.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${palette.name} - PaletteLab`,
          text: `Check out the ${palette.name} color palette on PaletteLab: ${palette.colors.join(', ')}`,
          url,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }
    copyValue(url, 'Palette URL copied to clipboard');
  };

  return (
    <div
      id={`palette-card-${palette.id}`}
      onClick={() => openPalette(palette)}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Large Dominant Color Blocks */}
      <div className="h-44 sm:h-48 w-full flex overflow-hidden rounded-t-2xl relative">
        {palette.colors.map((hex, idx) => {
          const colorInfo = getColorDetails(hex);
          const isJustCopied = copiedHex === hex;

          return (
            <div
              key={idx}
              style={{ backgroundColor: hex }}
              onClick={(e) => handleColorClick(hex, e)}
              className="flex-1 h-full relative group/slot transition-all duration-150 hover:flex-[1.6] flex flex-col justify-end p-2"
              title={`Click to copy ${hex}`}
            >
              {/* Overlay Hex pill on slot hover */}
              <div
                className={`transition-all duration-150 py-1 px-1.5 rounded-md text-[11px] font-mono font-semibold tracking-wider text-center shadow-xs flex items-center justify-center gap-1 ${
                  colorInfo.isDark ? 'text-white bg-black/50' : 'text-neutral-900 bg-white/75'
                } ${
                  isJustCopied
                    ? 'opacity-100 scale-105 ring-2 ring-indigo-400'
                    : 'opacity-0 group-hover/slot:opacity-100'
                }`}
              >
                {isJustCopied ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                <span>{hex}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Information & Action Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 gap-2.5 bg-white">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-neutral-900 truncate group-hover:text-indigo-600 transition-colors">
              {palette.name}
            </h2>
            <p className="text-xs text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              <span>by {palette.creator.name}</span>
              {palette.creator.verified && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
              )}
              <span className="text-neutral-400">•</span>
              <span className="capitalize">{palette.category}</span>
            </p>
          </div>

          {/* Like Heart Button */}
          <button
            id={`like-btn-${palette.id}`}
            onClick={(e) => toggleLike(palette.id, e)}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isLiked
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
            title={isLiked ? 'Unlike' : 'Like palette'}
            aria-label={`Like ${palette.name}`}
          >
            <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-rose-600 scale-110' : ''}`} />
            <span>{palette.likes}</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyPaletteHexes}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors flex items-center gap-1"
              title="Copy all HEX codes"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy HEX</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGeneratorPaletteFromColors(palette.colors);
              }}
              className="px-2 py-1 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors flex items-center gap-1"
              title="Open in Generator studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => toggleSave(palette.id, e)}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save to collection'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="Share palette"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
