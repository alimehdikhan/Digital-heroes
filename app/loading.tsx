export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-emerald-400/20 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t border-r border-emerald-400 animate-spin opacity-70"></div>
          <div className="absolute inset-2 rounded-full border-b border-l border-gold-400 animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white z-10 animate-pulse"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <p className="mt-6 font-body text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-400 animate-pulse">Initializing Interface</p>
      </div>
    </div>
  )
}
