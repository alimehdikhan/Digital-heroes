"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { submitScore, type ActionState } from "@/app/actions/scores"

const initialState: ActionState = { error: null, success: null, fieldErrors: {} }

function SubmitButton({ success }: { success: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className={`w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-lg flex items-center justify-center gap-3 ${
        success 
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
          : 'btn-primary text-navy-950'
      }`}
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-navy-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Transmitting...
        </>
      ) : success ? (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Transmission Complete
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Log Score
        </>
      )}
    </Button>
  )
}

export function ScoreForm() {
  const [score, setScore] = useState(18)
  const [state, formAction] = useActionState(submitScore, initialState)

  const handleIncrement = () => setScore(prev => Math.min(45, prev + 1))
  const handleDecrement = () => setScore(prev => Math.max(1, prev - 1))

  return (
    <form action={formAction} className="space-y-10 relative z-10">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
          {state.error}
        </div>
      )}
      <div className="space-y-4">
        <label className="font-body text-xs text-white/50 uppercase font-bold tracking-widest flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Score Magnitude
        </label>
        
        <div className="flex items-center justify-between gap-6">
          <button type="button" onClick={handleDecrement} className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center hover:border-gold-400/50 hover:bg-gold-400/5 transition-all active:scale-95 group bg-navy-900/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:text-gold-400"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          
          <div className="flex-1 text-center py-4 border-b-2 border-white/10 focus-within:border-gold-400 transition-all bg-navy-900/20 rounded-t-2xl">
            <input 
              type="number" 
              name="score"
              min="1" 
              max="45" 
              value={score} 
              onChange={(e) => setScore(Number(e.target.value))}
              className="bg-transparent w-full text-center font-display text-6xl md:text-7xl text-gold-400 font-bold border-none focus:ring-0 p-0" 
            />
            <span className="font-body text-xs font-bold text-white/30 block mt-2 uppercase tracking-widest">Total Points</span>
          </div>
          
          <button type="button" onClick={handleIncrement} className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center hover:border-gold-400/50 hover:bg-gold-400/5 transition-all active:scale-95 group bg-navy-900/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white group-hover:text-gold-400"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        {state.fieldErrors?.score && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.score[0]}</p>}
      </div>

      <div className="space-y-4">
        <label className="font-body text-xs text-white/50 uppercase font-bold tracking-widest flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Deployment Date
        </label>
        <input 
          type="date" 
          name="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-4 font-body text-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400/20 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8]" 
        />
        {state.fieldErrors?.date && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.date[0]}</p>}
      </div>

      <SubmitButton success={!!state.success} />
    </form>
  )
}
