"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { executeDraw, simulateDraw } from "@/app/actions/draw"
import { useToast } from "@/hooks/use-toast"
import { FadeIn } from "@/components/ui/motion"

export function DrawExecuteButton() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simResults, setSimResults] = useState<any>(null)
  const [mode, setMode] = useState<'algorithmic' | 'random'>('algorithmic')
  const { toast } = useToast()

  const handleSimulate = async () => {
    setIsSimulating(true)
    try {
      const d = new Date()
      // Pool amount is now auto-calculated on the server
      const results = await simulateDraw(d.getMonth() + 1, d.getFullYear(), mode)
      setSimResults(results)
      toast({
        title: "Simulation Complete",
        description: "Results calculated. Ready for execution.",
      })
    } catch (error: any) {
      toast({
        title: "Simulation Failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const handleExecute = async () => {
    if (!confirm('Are you absolutely sure you want to execute the draw? This will permanently distribute funds.')) return
    
    setIsExecuting(true)
    try {
      if (!simResults?.drawId) throw new Error("No simulation results found to execute.")
      await executeDraw(simResults.drawId)
      setSimResults(null)
      toast({
        title: "Draw Authorized",
        description: "Winning sequence broadcasted to nodes.",
        variant: "default",
      })
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.message || "An error occurred during the draw.",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className="flex gap-2 w-full p-1 bg-navy-900/50 rounded-lg border border-white/10">
        <button onClick={() => setMode('algorithmic')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${mode === 'algorithmic' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'text-white/50 hover:text-white border border-transparent'}`}>Algorithmic</button>
        <button onClick={() => setMode('random')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${mode === 'random' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'text-white/50 hover:text-white border border-transparent'}`}>Random</button>
      </div>
      {simResults && (
        <FadeIn className="glass-card p-6 rounded-2xl w-full border border-gold-400/30 bg-navy-900/80 text-left">
          <h4 className="font-display text-lg text-gold-400 font-bold mb-4">Simulation Results</h4>
          <div className="space-y-2 font-body text-sm text-white">
            <div className="flex justify-between"><span>Winning Sequence:</span> <strong>{simResults.winningNumbers.join(', ')}</strong></div>
            <div className="flex justify-between"><span>5 Match Winners (Jackpot):</span> <strong>{simResults.jackpotWinners.length}</strong></div>
            <div className="flex justify-between"><span>4 Match Winners (Silver):</span> <strong>{simResults.silverWinners.length}</strong></div>
            <div className="flex justify-between"><span>3 Match Winners (Bronze):</span> <strong>{simResults.bronzeWinners.length}</strong></div>
            {simResults.jackpotWinners.length === 0 && (
              <div className="mt-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">Jackpot Rollover Activated</div>
            )}
          </div>
        </FadeIn>
      )}

      <div className="flex gap-4 w-full">
        <Button 
          onClick={handleSimulate}
          disabled={isSimulating || isExecuting}
          className="flex-1 h-14 rounded-full font-body font-black uppercase tracking-[0.1em] text-xs transition-all duration-300 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 bg-transparent"
        >
          {isSimulating ? 'Simulating...' : 'Simulate'}
        </Button>
        <Button 
          onClick={handleExecute}
          disabled={isExecuting || !simResults}
          className={`group flex-1 relative h-14 rounded-full font-body font-black uppercase tracking-[0.1em] text-xs transition-all duration-500 overflow-hidden ${isExecuting ? 'bg-emerald-600 text-white shadow-none' : 'btn-primary bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-navy-950 shadow-emerald-glow border-none'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isExecuting ? 'Executing...' : 'Execute'}
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </Button>
      </div>
    </div>
  )
}
