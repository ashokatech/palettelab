import React, { useEffect, useRef, useCallback } from 'react';

/**
 * AdSense config — fully env-driven.
 * Set these in .env (local) or Cloudflare/Vercel env (production):
 *   VITE_ADSENSE_CLIENT        = ca-pub-XXXXXXXXXXXXXXXX  (your AdSense publisher ID)
 *   VITE_ADSENSE_SLOT_NATIVE   = <numeric slot>           (In-feed/native ad unit slot)
 *   VITE_ADSENSE_SLOT_SIDEBAR  = <numeric slot>           (Sidebar rectangle 300×250 slot)
 *   VITE_ADSENSE_SLOT_BANNER   = <numeric slot>           (Responsive banner slot)
 *   VITE_ADSENSE_AUTO_ADS      = 1                        (optional: enable Google Auto-ads)
 */
const ADSENSE_CLIENT_ID = (import.meta.env.VITE_ADSENSE_CLIENT as string) || '';

/** Real AdSense client looks like ca-pub-XXXXXXXXXXXXXXXX (16 digits after ca-pub-) */
const isRealClient =
  ADSENSE_CLIENT_ID.startsWith('ca-pub-') &&
  ADSENSE_CLIENT_ID !== 'ca-pub-PLACEHOLDER' &&
  ADSENSE_CLIENT_ID !== 'ca-pub-XXXXXXXX' &&
  ADSENSE_CLIENT_ID !== 'ca-pub-XXXXXXXXXXXXXXXX';

/** Slot IDs from env — empty string = not configured */
const SLOTS: Record<string, string> = {
  native: ((import.meta.env.VITE_ADSENSE_SLOT_NATIVE as string) || '').trim(),
  sidebar: ((import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR as string) || '').trim(),
  banner: ((import.meta.env.VITE_ADSENSE_SLOT_BANNER as string) || '').trim(),
};

const AUTO_ADS = (import.meta.env.VITE_ADSENSE_AUTO_ADS as string) === '1';

/** Check if a slot ID looks like a real numeric AdSense slot */
function isValidSlot(id: string): boolean {
  return /^\d{5,15}$/.test(id);
}

/** Whether a given ad type has a real, configured slot */
export function canShowAd(type: 'native-card' | 'sidebar' | 'banner'): boolean {
  return isRealClient && isValidSlot(SLOTS[type] || '');
}

interface AdContainerProps {
  type?: 'native-card' | 'sidebar' | 'banner';
  index?: number;
  adSlot?: string;
  className?: string;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  type = 'native-card', index = 0, adSlot, className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const resolvedSlot = adSlot || SLOTS[type] || '';
  const hasRealSlot = isRealClient && isValidSlot(resolvedSlot);

  const pushAd = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !hasRealSlot) return;
      const ins = adRef.current?.querySelector('ins.adsbygoogle') as HTMLElement | null;
      if (!ins || ins.dataset.adsbygooglePushed === '1') return;
      ins.dataset.adsbygooglePushed = '1';
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch { /* blocked or StrictMode */ }
  }, [hasRealSlot]);

  useEffect(() => {
    const id = requestAnimationFrame(pushAd);
    return () => cancelAnimationFrame(id);
  }, [pushAd]);

  // SLOT NOT CONFIGURED — styled placeholder telling dev what to set
  if (!hasRealSlot) {
    return (
      <div className={`bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[140px] ${className}`}>
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2"><span className="text-sm">⚡</span></div>
        <p className="text-xs font-semibold text-neutral-600">Ad Slot Not Configured</p>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px] leading-snug">
          Set <code className="bg-neutral-100 px-1 rounded">VITE_ADSENSE_SLOT_{type.toUpperCase()}</code> in <code className="bg-neutral-100 px-1 rounded">.env</code> to activate ads here.
        </p>
      </div>
    );
  }

  // NATIVE CARD (In-feed ad between palette cards)
  if (type === 'native-card') {
    return (
      <div ref={adRef} className={`bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-md flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-neutral-700 ${className}`}>
        <div className="flex items-center justify-between z-10 pb-2 border-b border-neutral-800">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-wider text-amber-300 uppercase">Ad</span>
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Sponsored</span>
        </div>
        <div className="my-2 min-h-[120px] w-full z-10">
          <ins className="adsbygoogle" style={{ display: 'block', minHeight: 120 }} data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={resolvedSlot} data-ad-format="auto" data-full-width-responsive="true" />
        </div>
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 z-10">
          <span>Ads by Google</span>
        </div>
      </div>
    );
  }

  // SIDEBAR (300x250 rectangle for palette detail / tools)
  if (type === 'sidebar') {
    return (
      <div ref={adRef} className={`p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-xs space-y-3 ${className}`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-800">
          <span>Ad</span><span className="font-mono text-neutral-500">300x250</span>
        </div>
        <div className="min-h-[250px] w-full">
          <ins className="adsbygoogle" style={{ display: 'block', minHeight: 250 }} data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={resolvedSlot} data-ad-format="rectangle" />
        </div>
      </div>
    );
  }

  // BANNER (Responsive, below hero or between sections)
  return (
    <div ref={adRef} className={`w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 pb-2 border-b border-neutral-800">
        <span className="text-amber-300">Google Ad</span>
      </div>
      <div className="w-full min-h-[90px]">
        <ins className="adsbygoogle" style={{ display: 'block', minHeight: 90 }} data-ad-client={ADSENSE_CLIENT_ID} data-ad-slot={resolvedSlot} data-ad-format="auto" data-full-width-responsive="true" />
      </div>
    </div>
  );
};

// Hook: inject AdSense loader + preconnect hints once on mount
export function useInjectAdSenseScript() {
  useEffect(() => {
    if (!isRealClient) return;
    const scriptId = 'adsbygoogle-script';
    if (!document.getElementById(scriptId)) {
      // Preconnect hints speed up first ad load
      const hints: [string, string][] = [
        ['preconnect', 'https://pagead2.googlesyndication.com'],
        ['dns-prefetch', 'https://pagead2.googlesyndication.com'],
        ['dns-prefetch', 'https://googleads.g.doubleclick.net'],
        ['dns-prefetch', 'https://adservice.google.com'],
      ];
      for (const [rel, href] of hints) {
        if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
          const l = document.createElement('link');
          l.rel = rel; l.href = href;
          document.head.appendChild(l);
        }
      }
      const s = document.createElement('script');
      s.id = scriptId; s.async = true; s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      if (AUTO_ADS) s.setAttribute('data-ad-client', ADSENSE_CLIENT_ID);
      document.head.appendChild(s);
    }
  }, []);
}
