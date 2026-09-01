/**
 * Analytics — GA4 + Clarity, env-driven. No-ops if IDs missing.
 * Usage: initAnalytics() once on mount, then trackEvent()
 */

let inited = false;

export function initAnalytics() {
  if (inited || typeof window === 'undefined' || typeof document === 'undefined') return;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  const clarityId = import.meta.env.VITE_CLARITY_ID as string | undefined;

  if (gaId && gaId !== 'G-PLACEHOLDER') {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    // @ts-ignore
    window.gtag('js', new Date());
    // @ts-ignore
    window.gtag('config', gaId, { send_page_view: true });
    inited = true;
  }

  if (clarityId && clarityId !== 'PLACEHOLDER') {
    (function(c:any,l:any,a:any,r:any,i:any){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      const t=l.createElement(r) as HTMLScriptElement;t.async=true;t.src="https://www.clarity.ms/tag/"+i;
      const y=l.getElementsByTagName(r)[0];y.parentNode!.insertBefore(t,y);
    })(window as any, document, "clarity", "script", clarityId);
  }
  if (gaId || clarityId) inited = true;
}

export function trackEvent(action: string, params: Record<string, any> = {}) {
  try {
    // GA4
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', action, params);
    }
    // Clarity custom tag
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      // @ts-ignore
      window.clarity('event', action);
    }
  } catch {}
}

export function trackPageView(path: string) {
  trackEvent('page_view', { page_path: path });
}
