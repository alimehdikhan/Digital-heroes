"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { submitScore, type ActionState } from "@/app/actions/scores"
import { Button } from "@/components/ui/button"
import { SlideUp, FadeIn } from "@/components/ui/motion"

const initialState: ActionState = { error: null, success: null, fieldErrors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-lg flex items-center justify-center gap-3 btn-primary text-navy-950"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-navy-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ENCRYPTING...
        </>
      ) : (
        <>
          SUBMIT SCORE
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </>
      )}
    </Button>
  )
}

export default function SubmitProofPage() {
  const [state, formAction] = useActionState(submitScore, initialState)
  return (
    <div className="space-y-12 pb-12">
      <SlideUp className="flex flex-col items-center text-center pt-8 mb-12">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="font-body text-[10px] uppercase font-bold tracking-widest">Secure Verification Protocol</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">Submit Your Triumph</h1>
        <p className="text-white/70 font-body text-lg max-w-2xl mx-auto">Upload your digital proof to finalize your hero status. Our encrypted ledger ensures every point contributed is verified and secured.</p>
      </SlideUp>

      <FadeIn delay={0.2} className="max-w-4xl mx-auto">
        <div className="glass-card rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-400/5 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/5 blur-[100px] rounded-full"></div>
          
          <form action={formAction} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {state.error && (
              <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
                {state.error}
              </div>
            )}
            {/* Input Fields */}
            <div className="space-y-3">
              <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1" htmlFor="round-date">Round Date</label>
              <div className="relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input 
                  id="round-date"
                  name="date"
                  type="date" 
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-body focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all [&::-webkit-calendar-picker-indicator]:invert-[0.8]" 
                />
              </div>
              {state.fieldErrors?.date && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.date[0]}</p>}
            </div>

            <div className="space-y-3">
              <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1" htmlFor="course-name">Course Name</label>
              <div className="relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input 
                  id="course-name"
                  name="notes"
                  type="text" 
                  placeholder="Enter venue name / notes"
                  className="w-full bg-navy-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-body focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20" 
                />
              </div>
              {state.fieldErrors?.notes && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.notes[0]}</p>}
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1" htmlFor="score">Final Stableford Score</label>
              <div className="relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                <input 
                  id="score"
                  name="score"
                  type="number" 
                  min="1"
                  max="45"
                  required
                  placeholder="e.g. 42"
                  className="w-full bg-navy-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-body focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20" 
                />
              </div>
              {state.fieldErrors?.score && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.score[0]}</p>}
            </div>

            <div className="md:col-span-2 pt-6">
              <SubmitButton />
              <p className="text-center mt-6 text-[10px] text-white/30 font-body uppercase tracking-[0.2em] font-bold">Verified by HeroShield™ Encryption</p>
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}
