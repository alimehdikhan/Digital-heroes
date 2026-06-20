"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState, useEffect, useState } from "react"
import { FadeIn } from "@/components/ui/motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { signup, type ActionState } from "@/app/actions/auth"

const initialState: ActionState = { error: null, success: null, fieldErrors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button size="lg" type="submit" disabled={pending} className="relative w-full h-14 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 rounded-xl text-navy-950 font-body uppercase tracking-[0.2em] font-black shadow-lg border-none">
      {pending ? 'Registering...' : 'Be a Hero'}
    </Button>
  )
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(signup, initialState)
  const [charities, setCharities] = useState<any[]>([])
  const [charityPercentage, setCharityPercentage] = useState(10)

  useEffect(() => {
    const fetchCharities = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('charities').select('id, name').eq('is_deleted', false)
      if (data) setCharities(data)
    }
    fetchCharities()
  }, [])

  return (
    <FadeIn delay={0.1}>
      <div className="glass-card rounded-2xl p-10 md:p-12 shadow-emerald-glow relative group">
        <div className="absolute inset-0 rounded-2xl border border-emerald-400/10 group-hover:border-emerald-400/20 transition-colors pointer-events-none" />
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-emerald-400 mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-400/10 shadow-emerald-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h2 className="font-display text-2xl text-white tracking-tight mb-2 font-bold">Digital Heroes</h2>
          <div className="h-px w-12 bg-emerald-400/30 mb-6"></div>
          <h1 className="font-display text-3xl md:text-4xl text-white italic font-bold">Join the Mission</h1>
        </div>

        {/* Signup Form */}
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-sm font-body">
              {state.success}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group/input">
              <label htmlFor="name" className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">First Name</label>
              <input 
                className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
                placeholder="Jane" 
                type="text"
                id="name"
                name="name"
                autoComplete="given-name"
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-red-400 text-xs mt-1">{state.fieldErrors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2 group/input">
              <label htmlFor="last_name" className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Last Name</label>
              <input 
                className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
                placeholder="Doe" 
                type="text"
                id="last_name"
                name="last_name"
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 group/input">
            <label htmlFor="email" className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Email Address</label>
            <input 
              className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
              placeholder="hero@digitalheroes.io" 
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          
          <div className="space-y-2 group/input">
            <label htmlFor="password" className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Password</label>
            <input 
              className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
              placeholder="••••••••" 
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-2 group/input">
            <label className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Supported Charity</label>
            <select 
              name="charity_id"
              className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all appearance-none" 
            >
              <option value="">Select a charity to support (10% of your pool)</option>
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 group/input">
            <div className="flex justify-between items-center ml-1">
              <label className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold">Contribution (%)</label>
              <span className="text-white text-xs font-bold">{charityPercentage}%</span>
            </div>
            <input 
              type="range" 
              name="charity_percentage"
              min="10" max="100" 
              value={charityPercentage} 
              onChange={(e) => setCharityPercentage(parseInt(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>

          <div className="flex items-start gap-3 mt-4">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 w-4 h-4 rounded border-white/20 bg-navy-950/50 text-emerald-400 focus:ring-emerald-400/30"
              required
            />
            <label htmlFor="terms" className="font-body text-sm text-white/70 leading-relaxed">
              I agree to the <Link href="/terms" className="text-emerald-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <div className="pt-4 relative group/btn">
            <div className="absolute -inset-1 bg-emerald-400/30 blur-xl rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <SubmitButton />
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="font-body text-white/50 text-sm">
            Already a hero? 
            <Link className="text-emerald-400 hover:text-emerald-300 hover:underline decoration-emerald-400/30 underline-offset-4 ml-2 transition-all font-medium" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </FadeIn>
  )
}
