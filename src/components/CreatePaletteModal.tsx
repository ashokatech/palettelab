import React, { useState } from 'react';
import { usePalette } from '../context/PaletteContext';
import { Plus, Minus, X, Check, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/seedPalettes';
import { normalizeHex } from '../utils/colorUtils';

interface CreatePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePaletteModal: React.FC<CreatePaletteModalProps> = ({ isOpen, onClose }) => {
  const { saveNewPalette, openPalette } = usePalette();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Trending');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['brand', 'modern']);
  const [colors, setColors] = useState<string[]>([
    '#264653',
    '#2A9D8F',
    '#E9C46A',
    '#F4A261',
    '#E76F51',
  ]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleColorChange = (index: number, val: string) => {
    setColors((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAddColor = () => {
    if (colors.length >= 6) return;
    setColors((prev) => [...prev, '#3B82F6']);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 3) return;
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for your palette.');
      return;
    }

    // Validate HEX codes
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (let c of colors) {
      const norm = normalizeHex(c);
      if (!hexPattern.test(norm)) {
        setError(`Invalid HEX color format: ${c}`);
        return;
      }
    }

    const created = saveNewPalette(name, colors, category, tags);
    onClose();
    openPalette(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-neutral-900">Create & Publish Palette</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Palette Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Palette Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Nordic Horizon"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                <option key={c.key} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Slots Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700">
                Colors ({colors.length}/6)
              </label>
              {colors.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Color</span>
                </button>
              )}
            </div>

            {/* Live Visual Preview */}
            <div className="h-14 rounded-xl overflow-hidden flex border border-neutral-200 shadow-inner">
              {colors.map((c, idx) => (
                <div key={idx} style={{ backgroundColor: c }} className="flex-1 h-full" />
              ))}
            </div>

            {/* Swatch Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {colors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 bg-neutral-50"
                >
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                    className="w-full text-xs font-mono font-semibold uppercase bg-white px-2 py-1 rounded border border-neutral-300 outline-none"
                  />
                  {colors.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-neutral-400 hover:text-rose-600 p-1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag (press Enter)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Publish Palette</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
