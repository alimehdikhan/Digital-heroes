"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] z-0"></div>
      
      <div className="glass-card relative z-10 max-w-lg w-full p-8 md:p-12 rounded-[32px] border border-red-500/20 text-center">
        <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        
        <h2 className="font-display text-3xl text-white font-bold mb-4">System Disruption</h2>
        <p className="text-white/70 font-body text-sm mb-8 leading-relaxed">
          An unexpected anomaly occurred within the application layer. The system has automatically halted the process to maintain integrity.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={reset}
            className="w-full h-14 rounded-xl font-body font-black uppercase tracking-[0.1em] text-sm transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-none"
          >
            Attempt Recovery
          </Button>
          <a href="/dashboard" className="text-white/50 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors block text-center py-2">
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
