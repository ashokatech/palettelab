import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePalette } from '../context/PaletteContext';
import {
  extractDeepPhotoAnalysis,
  DeepPhotoAnalysis,
  ExtractedColorItem,
  getColorDetails,
  formatCssVariables,
  formatTailwindConfig,
  rgbToHex,
} from '../utils/colorUtils';
import {
  Upload,
  Sparkles,
  Copy,
  Sliders,
  Eye,
  Download,
  Share2,
  ExternalLink,
  Pipette,
  Layers,
  Palette as PaletteIcon,
  RefreshCw,
  Sun,
  Moon,
  Flame,
  Feather,
  Droplets,
  Camera,
  Check,
  Zap,
  Info,
  Maximize2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SamplePhoto {
  name: string;
  category: string;
  url: string;
}

const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    name: 'Santorini Sunset',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Cyberpunk Tokyo',
    category: 'Vibrant',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Tropical Coastline',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Autumn Alpine Forest',
    category: 'Warmth',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Nordic Architecture',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Desert Dunes at Dusk',
    category: 'Earth',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
  },
];

type ExtractorTab =
  | 'dominant'
  | 'vibrant'
  | 'pastel'
  | 'shadows'
  | 'highlights'
  | 'warm'
  | 'cool'
  | 'all'
  | 'eyedropper'
  | 'card-creator';

export const ImageExtractorView: React.FC = () => {
  const {
    copyValue,
    showToast,
    setGeneratorPaletteFromColors,
    saveNewPalette,
    openColorDetail,
    setActiveTab,
    setToolSubTab,
  } = usePalette();

  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [photoTitle, setPhotoTitle] = useState<string>('Santorini Sunset');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<ExtractorTab>('dominant');
  const [analysis, setAnalysis] = useState<DeepPhotoAnalysis | null>(null);
  const [colorCount, setColorCount] = useState<number>(6);

  // Eyedropper & Custom Picked Colors state
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: string; x: number; y: number } | null>(null);
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);

  // Social Card Customization
  const [cardStyle, setCardStyle] = useState<'modern' | 'polaroid' | 'split' | 'spec'>('modern');
  const [cardPaletteSource, setCardPaletteSource] = useState<ExtractorTab>('dominant');
  const [isExportingCard, setIsExportingCard] = useState<boolean>(false);

  // AI Story state
  const [aiStory, setAiStory] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  // Handle global clipboard paste of images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setImageSrc(event.target.result as string);
                setPhotoTitle('Pasted Image from Clipboard');
                showToast({ type: 'success', title: 'Image pasted from clipboard!' });
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showToast]);

  // Analyze image on load
  const processImageSource = useCallback((src: string, count: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = sampleCanvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // High enough resolution for nuanced color detection, scaled for speed
      const targetWidth = 400;
      const scale = targetWidth / img.width;
      const targetHeight = Math.round(img.height * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      try {
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const result = extractDeepPhotoAnalysis(imgData, count);
        setAnalysis(result);
      } catch (err) {
        console.warn('Image extraction notice:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      setIsProcessing(false);
      showToast({ type: 'info', title: 'Could not analyze external image directly (CORS). Uploading works perfectly!' });
    };
    img.src = src;
  }, [showToast]);

  useEffect(() => {
    processImageSource(imageSrc, colorCount);
  }, [imageSrc, colorCount, processImageSource]);

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setPhotoTitle(file.name.replace(/\.[^/.]+$/, ''));
          showToast({ type: 'success', title: 'Photo uploaded & processed!' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setPhotoTitle(file.name.replace(/\.[^/.]+$/, ''));
          showToast({ type: 'success', title: 'Photo dropped & analyzed!' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Interactive Eyedropper on image
  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = sampleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const normX = clientX / rect.width;
    const normY = clientY / rect.height;

    const pixelX = Math.floor(normX * canvas.width);
    const pixelY = Math.floor(normY * canvas.height);

    try {
      const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setHoverColor({
        hex,
        rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
        x: clientX,
        y: clientY,
      });
      setIsHoveringImage(true);
    } catch {
      // ignore
    }
  };

  const handleImageClick = () => {
    if (hoverColor) {
      if (!pickedColors.includes(hoverColor.hex)) {
        setPickedColors((prev) => [...prev, hoverColor.hex]);
        copyValue(hoverColor.hex, `Sampled ${hoverColor.hex}`, hoverColor.hex);
      } else {
        copyValue(hoverColor.hex, `Copied ${hoverColor.hex}`, hoverColor.hex);
      }
    }
  };

  // Get active palette array based on selected sub-tab
  const getCurrentPaletteColors = (): ExtractedColorItem[] => {
    if (!analysis) return [];
    switch (activeTabKey) {
      case 'dominant':
        return analysis.dominant;
      case 'vibrant':
        return analysis.vibrant;
      case 'pastel':
        return analysis.pastel;
      case 'shadows':
        return analysis.shadows;
      case 'highlights':
        return analysis.highlights;
      case 'warm':
        return analysis.warm;
      case 'cool':
        return analysis.cool;
      case 'all':
        return analysis.allClusters;
      case 'eyedropper':
        return pickedColors.map((hex) => {
          const d = getColorDetails(hex);
          return {
            hex,
            name: d.name,
            percentage: 0,
            r: d.rgb.r,
            g: d.rgb.g,
            b: d.rgb.b,
            h: d.hsl.h,
            s: d.hsl.s,
            l: d.hsl.l,
            isDark: d.isDark,
          };
        });
      default:
        return analysis.dominant;
    }
  };

  const activeColors = getCurrentPaletteColors();
  const rawHexList = activeColors.map((c) => c.hex);

  // Copy all hexes
  const handleCopyAllHexes = () => {
    const text = rawHexList.join(', ');
    copyValue(text, `Copied ${rawHexList.length} hex codes`);
  };

  // Send to Generator
  const handleSendToGenerator = () => {
    setGeneratorPaletteFromColors(rawHexList.slice(0, 8));
    setActiveTab('generator');
    showToast({ type: 'success', title: 'Opened in Harmonic Generator' });
  };

  // Test in UI Mockup
  const handleTestInUi = () => {
    setToolSubTab('ui-preview');
    showToast({ type: 'info', title: 'Loaded in Live UI Simulator' });
  };

  // Save as custom palette
  const handleSaveAsPalette = () => {
    const name = `${photoTitle} (${activeTabKey.toUpperCase()})`;
    saveNewPalette(name, rawHexList.slice(0, 6), 'Photo Extracted', ['photo', activeTabKey]);
    showToast({ type: 'success', title: `Saved "${name}" to your library!` });
  };

  // AI Story generation
  const handleGenerateAiStory = async () => {
    setIsGeneratingStory(true);
    try {
      const response = await fetch('/api/generate-ai-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze the color psychology and atmosphere of a photo named "${photoTitle}" with colors ${rawHexList.slice(0, 5).join(', ')}. Give a 2-sentence design critique and brand recommendation.`,
          count: 5,
        }),
      });
      const data = await response.json();
      if (data.description) {
        setAiStory(data.description);
      } else {
        setAiStory(`A balanced, harmonic composition inspired by "${photoTitle}". The primary tones create an organic, atmospheric visual hierarchy suitable for modern web interfaces, branding kits, and editorial layouts.`);
      }
    } catch {
      setAiStory(`A balanced, harmonic composition inspired by "${photoTitle}". The primary tones create an organic, atmospheric visual hierarchy suitable for modern web interfaces, branding kits, and editorial layouts.`);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Download Social Palette Card as PNG
  const handleDownloadCard = () => {
    setIsExportingCard(true);
    const canvas = exportCanvasRef.current;
    if (!canvas) {
      setIsExportingCard(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExportingCard(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // High resolution card: 1200 x 1500 px (4:5 social format)
      const width = 1200;
      const height = 1500;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = cardStyle === 'polaroid' ? '#FFFFFF' : '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Card Header
      ctx.fillStyle = cardStyle === 'polaroid' ? '#1E293B' : '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(photoTitle, 80, 100);

      ctx.fillStyle = cardStyle === 'polaroid' ? '#64748B' : '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.fillText(`PaletteLab • Photo Color Breakdown • ${activeTabKey.toUpperCase()}`, 80, 145);

      // Draw Photo (contained with rounded corners)
      const photoX = 80;
      const photoY = 180;
      const photoWidth = width - 160;
      const photoHeight = 760;

      ctx.save();
      // Rounded photo clip
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoWidth, photoHeight, 28);
      ctx.clip();
      ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
      ctx.restore();

      // Draw Swatches
      const colorsToDraw = rawHexList.slice(0, 6);
      const swatchY = 980;
      const swatchHeight = 360;
      const swatchWidth = (photoWidth - (colorsToDraw.length - 1) * 16) / colorsToDraw.length;

      colorsToDraw.forEach((hex, i) => {
        const x = photoX + i * (swatchWidth + 16);

        // Swatch Bar
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.roundRect(x, swatchY, swatchWidth, 220, 18);
        ctx.fill();

        // Hex Label
        ctx.fillStyle = cardStyle === 'polaroid' ? '#0F172A' : '#F8FAFC';
        ctx.font = 'bold 26px monospace';
        ctx.fillText(hex, x, swatchY + 270);

        // Color Name
        const details = getColorDetails(hex);
        ctx.fillStyle = cardStyle === 'polaroid' ? '#64748B' : '#94A3B8';
        ctx.font = '18px sans-serif';
        const truncatedName = details.name.length > 14 ? `${details.name.substring(0, 12)}...` : details.name;
        ctx.fillText(truncatedName, x, swatchY + 305);
      });

      // Watermark / Brand footer
      ctx.fillStyle = cardStyle === 'polaroid' ? '#94A3B8' : '#475569';
      ctx.font = '20px sans-serif';
      ctx.fillText('Generated with PaletteLab • palettelab.app', 80, height - 50);

      // Download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${photoTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-palette-card.png`;
        link.href = dataUrl;
        link.click();
        showToast({ type: 'success', title: 'Palette card downloaded (HD PNG)!' });
      } catch (err) {
        showToast({ type: 'info', title: 'Export rendered! Right-click preview image to save.' });
      } finally {
        setIsExportingCard(false);
      }
    };
    img.src = imageSrc;
  };

  return (
    <div id="deep-image-extractor-container" className="space-y-8">
      
      {/* Hidden processing canvases */}
      <canvas ref={sampleCanvasRef} className="hidden" />
      <canvas ref={exportCanvasRef} className="hidden" />

      {/* ========================================================================= */}
      {/* MONETIZATION / SPONSOR HERO LEADERBOARD BANNER                            */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-neutral-900 via-neutral-800 to-indigo-950 p-4 sm:p-5 text-white shadow-md border border-neutral-700/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Sponsor Spotlight
                </span>
                <span className="text-xs text-neutral-400 font-medium">Design Partner</span>
              </div>
              <p className="text-sm font-semibold text-neutral-100 mt-0.5">
                Adobe Creative Cloud & Figma Sync — Transform photos into production UI tokens instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.figma.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>Explore Plugins</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <button
              onClick={() => showToast({ type: 'info', title: 'Ad placements help keep PaletteLab free forever!' })}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 text-[11px]"
              title="Sponsored Advertisement"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Extractor Workspace */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                Photo Color Intelligence Engine
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Multi-Palette Analysis
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Extracts dominant tones, vibrant highlights, pastel undertones, shadows, and full distribution percentages from any image.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>

            <button
              onClick={() => {
                const randomSample = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
                setImageSrc(randomSample.url);
                setPhotoTitle(randomSample.name);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Load random preset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Random Photo</span>
            </button>
          </div>
        </div>

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: Image Canvas, Drag-Drop, Eyedropper & Loupe         */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Interactive Image Container with Live Eyedropper */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={() => setIsHoveringImage(false)}
              onClick={handleImageClick}
              className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 group cursor-crosshair select-none shadow-sm aspect-4/3 flex items-center justify-center"
            >
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
                  <span className="text-xs font-semibold">Extracting multi-thematic color spaces...</span>
                </div>
              )}

              <img
                ref={imageRef}
                src={imageSrc}
                alt={photoTitle}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                crossOrigin="anonymous"
              />

              {/* Live Loupe / Eyedropper overlay */}
              {isHoveringImage && hoverColor && (
                <div
                  className="absolute pointer-events-none z-10 transition-transform duration-75"
                  style={{
                    left: `${hoverColor.x}px`,
                    top: `${hoverColor.y}px`,
                    transform: 'translate(-50%, -120%)',
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-4 border-white shadow-2xl overflow-hidden relative flex items-center justify-center ring-2 ring-black/40">
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: hoverColor.hex }}
                      />
                      {/* Loupe crosshair */}
                      <div className="absolute w-2.5 h-0.5 bg-white/80" />
                      <div className="absolute h-2.5 w-0.5 bg-white/80" />
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-md bg-neutral-950/90 text-white backdrop-blur-md shadow-lg text-[10px] font-mono font-bold flex items-center gap-1 border border-white/20 whitespace-nowrap">
                      <span>{hoverColor.hex}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Instructions Badge */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md text-[11px] font-medium flex items-center gap-1.5 border border-white/10">
                  <Pipette className="w-3 h-3 text-indigo-300" />
                  <span>Click photo to sample color</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-black/60 text-neutral-300 backdrop-blur-md text-[10px] font-mono">
                  Paste Ctrl+V enabled
                </span>
              </div>
            </div>

            {/* Sample Photo Presets Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Quick Test Library:</span>
                <span className="text-neutral-400">High-res inspiration</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SAMPLE_PHOTOS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setImageSrc(s.url);
                      setPhotoTitle(s.name);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-4/3 border transition-all ${
                      imageSrc === s.url
                        ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-xs'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={s.url}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate">{s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Picked Colors Row */}
            {pickedColors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Pipette className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-neutral-800">
                      Custom Picked Colors ({pickedColors.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setPickedColors([])}
                    className="text-[11px] text-neutral-500 hover:text-red-600 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pickedColors.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyValue(hex, `Copied ${hex}`, hex)}
                      style={{ backgroundColor: hex }}
                      className="h-8 px-2.5 rounded-lg border border-black/10 shadow-2xs text-[10px] font-mono font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <span className="px-1 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                        {hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ========================================================= */}
          {/* RIGHT: Multi-Palette Tab Selector & Deep Analysis Results */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Thematic Category Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700">
                  Extracted Palette Dimensions:
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500 font-medium">Palette Size:</span>
                  <select
                    value={colorCount}
                    onChange={(e) => setColorCount(Number(e.target.value))}
                    className="text-xs font-semibold bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 text-neutral-800"
                  >
                    <option value={4}>4 Colors</option>
                    <option value={5}>5 Colors</option>
                    <option value={6}>6 Colors</option>
                    <option value={8}>8 Colors</option>
                  </select>
                </div>
              </div>

              {/* Horizontal Scrollable Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
                <button
                  onClick={() => setActiveTabKey('dominant')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'dominant'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <PaletteIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dominant</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('vibrant')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'vibrant'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vibrant & Pop</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('pastel')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'pastel'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5 text-pink-400" />
                  <span>Pastel & Soft</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('shadows')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'shadows'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Moody Shadows</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('highlights')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'highlights'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Highlights</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'all'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All 24 Colors</span>
                </button>

                <button
                  onClick={() => setActiveTabKey('card-creator')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeTabKey === 'card-creator'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Export Card</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Swatch Display (Color Block) */}
            {activeTabKey !== 'card-creator' && (
              <div className="space-y-4">
                
                {/* Visual Strip */}
                <div className="h-32 sm:h-36 rounded-2xl overflow-hidden flex border border-neutral-200 shadow-md">
                  {activeColors.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: item.hex,
                        flex: item.percentage ? Math.max(1, item.percentage) : 1,
                      }}
                      onClick={() => copyValue(item.hex, `Copied ${item.hex}`, item.hex)}
                      className="h-full cursor-pointer hover:brightness-105 transition-all flex flex-col justify-between p-3 group relative"
                    >
                      <div className="flex items-center justify-between">
                        {item.percentage > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                            {item.percentage}%
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-xs shadow-xs inline-block opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform">
                          {item.hex}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Proportional Distribution Bar Chart */}
                {analysis && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                      <span>Area Coverage Distribution:</span>
                      <span>Total Sampled: ~{analysis.totalSampledPixels.toLocaleString()} pixels</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden flex bg-neutral-100 border border-neutral-200">
                      {activeColors.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: c.hex,
                            width: `${c.percentage || (100 / activeColors.length)}%`,
                          }}
                          title={`${c.name} (${c.hex}): ${c.percentage}%`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Swatch Grid with Hex, RGB, HSL & Encyclopedia Link */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {activeColors.map((c, i) => {
                    const d = getColorDetails(c.hex);
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-3 group"
                      >
                        <div
                          style={{ backgroundColor: c.hex }}
                          onClick={() => copyValue(c.hex, `Copied ${c.hex}`, c.hex)}
                          className="w-10 h-10 rounded-xl border border-black/10 shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                        >
                          <Copy className="w-3.5 h-3.5 text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => copyValue(c.hex, `Copied ${c.hex}`, c.hex)}
                            className="text-xs font-mono font-bold text-neutral-900 hover:text-indigo-600 flex items-center gap-1 truncate"
                          >
                            <span>{c.hex}</span>
                          </button>
                          <p className="text-[10px] text-neutral-500 truncate">{c.name}</p>
                          <button
                            onClick={() => openColorDetail(c.hex)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Color-Hex Info</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Quick Tools Action Bar */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyAllHexes}
                      className="px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy All Hexes</span>
                    </button>

                    <button
                      onClick={handleSendToGenerator}
                      className="px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Harmonic Studio</span>
                    </button>

                    <button
                      onClick={handleTestInUi}
                      className="px-3.5 py-2 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>UI Mockup</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSaveAsPalette}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save to Library</span>
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* Card Creator & Social Export Sub-tab                      */}
            {/* ========================================================= */}
            {activeTabKey === 'card-creator' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Pinterest / Instagram / Design Card Studio
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Generate an aesthetic, high-resolution color spec card featuring your photo alongside its extracted swatches and metadata.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => setCardStyle('modern')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        cardStyle === 'modern'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Modern Dark
                    </button>

                    <button
                      onClick={() => setCardStyle('polaroid')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        cardStyle === 'polaroid'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Polaroid White
                    </button>

                    <button
                      onClick={() => setCardStyle('split')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        cardStyle === 'split'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Split Spec
                    </button>

                    <button
                      onClick={() => setCardStyle('spec')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        cardStyle === 'spec'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      Studio Minimal
                    </button>
                  </div>
                </div>

                {/* Social Card Live Preview */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl transition-all ${
                    cardStyle === 'polaroid'
                      ? 'bg-white border-neutral-200 text-neutral-900'
                      : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-extrabold">{photoTitle}</h4>
                        <p className={`text-[11px] ${cardStyle === 'polaroid' ? 'text-neutral-500' : 'text-slate-400'}`}>
                          PaletteLab • Photo Color Breakdown
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        HD 4:5 POSTER
                      </span>
                    </div>

                    {/* Card Photo Preview */}
                    <div className="rounded-2xl overflow-hidden aspect-16/10 border border-black/20">
                      <img
                        src={imageSrc}
                        alt="Card source"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Swatches strip */}
                    <div className="grid grid-cols-6 gap-2">
                      {rawHexList.slice(0, 6).map((hex, idx) => (
                        <div key={idx} className="space-y-1 text-center">
                          <div
                            style={{ backgroundColor: hex }}
                            className="h-14 rounded-xl border border-black/10 shadow-2xs"
                          />
                          <p className="text-[10px] font-mono font-bold truncate">{hex}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download CTA */}
                <button
                  onClick={handleDownloadCard}
                  disabled={isExportingCard}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingCard ? 'Rendering High-Res PNG...' : 'Download Social Palette Card (PNG)'}</span>
                </button>
              </div>
            )}

            {/* AI Mood & Story Critique */}
            <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-purple-50/70 via-indigo-50/40 to-neutral-50 border border-purple-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-950">
                    AI Atmosphere & Brand Harmony
                  </h4>
                </div>
                <button
                  onClick={handleGenerateAiStory}
                  disabled={isGeneratingStory}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingStory ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingStory ? 'Synthesizing...' : 'Re-analyze'}</span>
                </button>
              </div>

              <p className="text-xs text-purple-900/80 leading-relaxed">
                {aiStory ||
                  `The color distribution from "${photoTitle}" creates a naturally balanced emotional resonance. The predominant ${activeColors[0]?.name || 'primary hue'} serves as a sturdy foundation while secondary accent notes provide crisp contrast for conversion elements.`}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECONDARY HIGH-VALUE SPONSORED TOOL TILES (PRO REVENUE STREAM)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tile 1: Adobe Express / Pantone */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                Print & Packaging
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Partner</span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 mt-2">Pantone Connect Sync</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Match extracted photo RGB pixels directly against authentic PMS (Pantone Matching System) ink codes for physical manufacturing.
            </p>
          </div>
          <a
            href="https://www.pantone.com/connect"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Match PMS Swatches</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tile 2: Webflow & Tailwind */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                Front-End Code
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Developer</span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 mt-2">Tailwind & CSS Tokens</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Export this photo's full 24-step color spectrum directly into your `tailwind.config.js` with automated 50-950 lightness tiers.
            </p>
          </div>
          <button
            onClick={() => {
              const code = formatTailwindConfig(rawHexList, photoTitle);
              copyValue(code, 'Copied Tailwind Configuration');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-left"
          >
            <span>Copy Tailwind Code</span>
            <Copy className="w-3 h-3" />
          </button>
        </div>

        {/* Tile 3: Canva / Social Media */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                Social Creator
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">Template</span>
            </div>
            <h4 className="text-sm font-bold text-neutral-900 mt-2">Brand Moodboard Studio</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Transfer color schemes to Canva brand kits or export high-resolution moodboard banners for clients and social feeds.
            </p>
          </div>
          <button
            onClick={handleDownloadCard}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-left"
          >
            <span>Download High-Res Poster</span>
            <Download className="w-3 h-3" />
          </button>
        </div>

      </div>

    </div>
  );
};
