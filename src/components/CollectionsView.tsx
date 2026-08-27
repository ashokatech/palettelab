import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { PaletteCard } from './PaletteCard';
import { Bookmark, Heart, Sparkles, FolderPlus } from 'lucide-react';

export const CollectionsView: React.FC = () => {
  const { palettes, savedPaletteIds, likedPaletteIds, setActiveTab } = usePalette();
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'liked' | 'my-palettes'>('saved');

  const savedPalettes = palettes.filter((p) => savedPaletteIds.includes(p.id));
  const likedPalettes = palettes.filter((p) => likedPaletteIds.includes(p.id));
  const myPalettes = palettes.filter((p) => p.creator.name === 'You' || p.id.startsWith('custom-'));

  const currentList =
    activeSubTab === 'saved'
      ? savedPalettes
      : activeSubTab === 'liked'
      ? likedPalettes
      : myPalettes;

  return (
    <div id="collections-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            My Library & Collections
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Access your saved favorites, liked palettes, and personal custom creations.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'saved' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
            <span>Saved ({savedPalettes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('liked')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'liked' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Liked ({likedPalettes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my-palettes')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'my-palettes' ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Created by Me ({myPalettes.length})</span>
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentList.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200/70 text-neutral-500 flex items-center justify-center mx-auto">
            {activeSubTab === 'saved' ? (
              <Bookmark className="w-6 h-6" />
            ) : activeSubTab === 'liked' ? (
              <Heart className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">No palettes here yet</h3>
            <p className="text-xs text-neutral-500">
              {activeSubTab === 'saved'
                ? 'Save your favorite palettes across discovery to find them here.'
                : activeSubTab === 'liked'
                ? 'Tap the heart icon on any palette card to save it to your liked library.'
                : 'Use the Create Palette button or Harmonic Generator to publish custom schemes.'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Explore Discovery Feed
          </button>
        </div>
      )}
    </div>
  );
};
