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

export const NewsletterModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  useEffect(()=>{
    const dismissed = localStorage.getItem('palettelab_news_dismiss');
    if (dismissed) return;
    const t1 = setTimeout(()=> setOpen(true), 25000);
    const onExit = (e: MouseEvent) => { if (e.clientY < 5) setOpen(true); };
    document.addEventListener('mouseleave', onExit as any);
    return ()=>{ clearTimeout(t1); document.removeEventListener('mouseleave', onExit as any); };
  },[]);
  if (!open) return null;
  const submit = () => {
    if (!email.includes('@')) return;
    try{
      const list = JSON.parse(localStorage.getItem('palettelab_news_emails')||'[]');
      list.push({ email, at: new Date().toISOString() });
      localStorage.setItem('palettelab_news_emails', JSON.stringify(list));
    }catch{}
    trackEvent('newsletter_subscribe', { email_hash: email.length });
    setDone(true);
    setTimeout(()=>{ setOpen(false); localStorage.setItem('palettelab_news_dismiss','1'); }, 1800);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 relative">
        <button onClick={()=>{ setOpen(false); localStorage.setItem('palettelab_news_dismiss','1'); }} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100"><X className="w-4 h-4"/></button>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Mail className="w-5 h-5"/></div>
        <div>
          <h3 className="text-lg font-extrabold">Get the Weekly Palette Drop</h3>
          <p className="text-xs text-neutral-500 mt-1">Join 12k designers. 5 fresh palettes + 1 pro tip. No spam, unsubscribe anytime. Stored locally until backend.</p>
        </div>
        {!done ? (
          <div className="flex gap-2">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@studio.com" className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
            <button onClick={submit} className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 flex items-center gap-1.5">Subscribe <ArrowRight className="w-3.5 h-3.5"/></button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4"/> Subscribed! Check your inbox soon.</div>
        )}
        <p className="text-[11px] text-neutral-400">By subscribing you agree to Privacy. Emails kept locally in demo.</p>
      </div>
    </div>
  );
};
