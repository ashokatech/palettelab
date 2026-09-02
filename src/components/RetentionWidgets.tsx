import React, { useEffect, useState, useMemo } from 'react';
import { usePalette } from '../context/PaletteContext';
import { PaletteCard } from './PaletteCard';
import { Sparkles, Clock, X, Mail, ArrowRight, Trophy, Eye } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

// Daily Palette — deterministic by date
export const DailyPaletteChallenge: React.FC = () => {
  const { palettes, openPalette } = usePalette();
  const daily = useMemo(() => {
    if (!palettes.length) return null;
    const day = new Date().toISOString().slice(0,10);
    let h = 0; for (let i=0;i<day.length;i++) h = (h*31 + day.charCodeAt(i)) >>>0;
    return palettes[h % palettes.length];
  }, [palettes]);

  if (!daily) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><Trophy className="w-5 h-5" /></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">Daily Challenge</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">{new Date().toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-bold text-neutral-900">{daily.name} — <span className="text-amber-600">{daily.colors.join(' • ')}</span></p>
            <p className="text-xs text-neutral-500">Can you remix this palette in Generator? 1-click open.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex h-10 rounded-xl overflow-hidden border border-neutral-200">
            {daily.colors.map((c,i)=><span key={i} style={{background:c}} className="w-8 h-full block"/>)}
          </div>
          <button onClick={()=>{ trackEvent('daily_challenge_open',{slug:daily.slug}); openPalette(daily); }} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5"/> View & Remix
          </button>
        </div>
      </div>
    </div>
  );
};

export const RecentlyViewedRail: React.FC = () => {
  const { palettes, openPalette } = usePalette();
  const [ids, setIds] = useState<string[]>([]);
  useEffect(()=>{
    try{ setIds(JSON.parse(localStorage.getItem('palettelab_recent')||'[]')); }catch{}
    const h = () => { try{ setIds(JSON.parse(localStorage.getItem('palettelab_recent')||'[]')); }catch{}};
    window.addEventListener('storage', h);
    const iv = setInterval(h, 2000);
    return ()=>{ window.removeEventListener('storage',h); clearInterval(iv); };
  },[]);
  const items = useMemo(()=> ids.map(id=> palettes.find(p=>p.id===id)).filter(Boolean).slice(0,8) as any[], [ids,palettes]);
  if (!items.length) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 mb-2"><Clock className="w-3.5 h-3.5"/> Recently Viewed</div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((p:any)=>(
          <button key={p.id} onClick={()=> openPalette(p)} className="shrink-0 w-36 rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:shadow-md transition-all text-left">
            <div className="h-14 flex">{p.colors.map((c:string,i:number)=><span key={i} style={{background:c}} className="flex-1 h-full"/> )}</div>
            <div className="p-2"><p className="text-xs font-bold truncate">{p.name}</p><p className="text-[11px] text-neutral-500">{p.colors[0]}</p></div>
          </button>
        ))}
      </div>
    </div>
  );
};


