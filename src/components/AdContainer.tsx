import React, { useEffect, useRef } from 'react';

const ADSENSE_CLIENT_ID = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_CLIENT ? import.meta.env.VITE_ADSENSE_CLIENT : 'ca-pub-PLACEHOLDER';

interface AdContainerProps {
  type?: 'native-card' | 'sidebar' | 'banner';
  index?: number;
  adSlot?: string;
  className?: string;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  type = 'native-card',
  index = 0,
  adSlot = '1234567890',
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch { /* Safe catch for StrictMode or blocked */ }
  }, []);

  const isRealAdSense = ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER';

  // Native Grid Card — reserved height prevents CLS during ad load
  if (type === 'native-card') {
    return (
      <div className={`bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-md flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-neutral-700 ${className}`}>
        <div className="flex items-center justify-between z-10 pb-2 border-b border-neutral-800">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-wider text-amber-300 uppercase">Google AdSense</span>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">SPONSOR</span>
        </div>
        <div className="my-4 min-h-[120px] w-full flex flex-col justify-center items-center text-center z-10">
          {isRealAdSense ? (
            <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={adSlot} data-ad-format="auto" data-full-width-responsive="true" />
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700"><span className="text-amber-400">⚡</span></div>
              <div>
                <h4 className="text-xs font-bold text-neutral-200">Google Display Ad #{index + 1}</h4>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px] mx-auto leading-snug">Add your AdSense ID in production.</p>
              </div>
            </div>
          )}
        </div>
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 z-10">
          <span>Ads by Google</span><span className="font-mono">#{adSlot}</span>
        </div>
      </div>
    );
  }

  // Sidebar Ad — tall rectangle (300×250) reserved space for CLS
  if (type === 'sidebar') {
    return (
      <div className={`p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-xs space-y-3 ${className}`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800">
          <span>📢 Google Display Ad</span><span className="font-mono text-neutral-500">AD</span>
        </div>
        <div className="min-h-[250px] w-full">
          {isRealAdSense ? (
            <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={adSlot} data-ad-format="rectangle" />
          ) : (
            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-center space-y-1.5">
              <h5 className="text-xs font-bold text-neutral-200">Sidebar Ad Unit</h5>
              <p className="text-[11px] text-neutral-400">High-CPM placement for tools & palette detail pages.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Banner / Mobile — sticky banner below content area
  return (
    <div className={`w-full p-4 rounded-2xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-4 border border-neutral-800 shadow-md ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">GOOGLE AD</div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white">Responsive Ad Unit</h4>
          <p className="text-xs text-neutral-400 hidden sm:block">Auto-adapts across desktop, tablet, mobile.</p>
        </div>
      </div>
    </div>
  );
};

// Helper hook to inject AdSense loader script once on mount
export function useInjectAdSenseScript() {
  useEffect(() => {
    if (ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER') {
      const scriptId = 'adsbygoogle-script';
      if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.async = true;
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
      }
    }
  }, []);
}
