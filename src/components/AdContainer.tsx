import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, HelpCircle } from 'lucide-react';

interface AdContainerProps {
  type?: 'native-card' | 'sidebar' | 'banner';
  index?: number;
  adSlot?: string;
  className?: string;
}

// Configurable Google AdSense Publisher ID (Replace with your ca-pub-XXXXXXXXXXXXXXXX in production)
const ADSENSE_CLIENT_ID = 'ca-pub-PLACEHOLDER';

export const AdContainer: React.FC<AdContainerProps> = ({
  type = 'native-card',
  index = 0,
  adSlot = '1234567890',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Execute Google AdSense push when adsbygoogle script is loaded
    try {
      if (typeof window !== 'undefined' && ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // Safe catch for React StrictMode double render or blocked ads
    }
  }, []);

  // If real Google AdSense client ID is configured, render real Google AdSense <ins> unit
  const isRealAdSense = ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER';

  // -------------------------------------------------------------
  // 1. Native Grid Card Variant (Fits inside Palette Grid)
  // -------------------------------------------------------------
  if (type === 'native-card') {
    return (
      <div className={`bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-md flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-neutral-700 ${className}`}>
        
        {/* Ad Header Badge */}
        <div className="flex items-center justify-between z-10 pb-2 border-b border-neutral-800">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Google AdSense
          </span>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">SPONSOR</span>
        </div>

        {/* Real AdSense Unit or Dev Placeholder */}
        <div className="my-4 min-h-[120px] flex flex-col justify-center items-center text-center z-10">
          {isRealAdSense ? (
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '100%' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={adSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-200">Google Display Ad Unit #{index + 1}</h4>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px] mx-auto leading-snug">
                  Responsive display ad slot. Add your AdSense Publisher ID in production.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ad Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 z-10">
          <span>Ads by Google</span>
          <span className="font-mono">Slot #{adSlot}</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Sidebar Ad Variant (Fits next to Palette Generator / Tools)
  // -------------------------------------------------------------
  if (type === 'sidebar') {
    return (
      <div className={`p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-xs space-y-3 ${className}`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Google Display Ad
          </span>
          <span className="font-mono text-neutral-500">AD</span>
        </div>

        {isRealAdSense ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={adSlot}
            data-ad-format="rectangle"
          />
        ) : (
          <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-center space-y-1.5">
            <h5 className="text-xs font-bold text-neutral-200">Google AdSense Sidebar Unit</h5>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Targeted high-CPM display banner unit for tool sidebars.
            </p>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. Horizontal Banner Variant
  // -------------------------------------------------------------
  return (
    <div className={`w-full p-4 rounded-2xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-4 border border-neutral-800 shadow-md ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
          GOOGLE AD
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white">
            Google AdSense Responsive Leaderboard Unit
          </h4>
          <p className="text-xs text-neutral-400 hidden sm:block">
            Auto-adapts to screen size across desktop, tablet, and mobile.
          </p>
        </div>
      </div>
      <div className="text-xs text-neutral-500 font-mono">
        ca-pub-xxxxxxxxxxxx
      </div>
    </div>
  );
};
