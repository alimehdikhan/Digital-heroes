"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { FadeIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { login, type ActionState } from "@/app/actions/auth"

const initialState: ActionState = { error: null, success: null, fieldErrors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button size="lg" type="submit" disabled={pending} className="w-full h-14 btn-primary rounded-xl text-navy-950 font-body uppercase tracking-[0.2em] font-black shadow-lg">
      {pending ? 'Authenticating...' : 'Sign In'}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState)
  return (
    <FadeIn delay={0.1}>
      <div className="glass-card rounded-2xl p-10 md:p-12 shadow-card relative group">
        {/* Subtle hover effect border */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="text-gold-400 mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-gold-400/10 shadow-gold-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="font-display text-2xl text-white tracking-tight mb-2 font-bold">Digital Heroes</h2>
          <div className="h-px w-12 bg-gold-400/30 mb-6"></div>
          <h1 className="font-display text-3xl md:text-4xl text-white italic font-bold">Welcome Back</h1>
        </div>

        {/* Login Form */}
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
              {state.error}
            </div>
          )}
          <div className="space-y-2 group/input">
            <label className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Email Address</label>
            <input 
              className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
              placeholder="hero@digitalheroes.io" 
              type="email"
              name="email"
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2 group/input">
            <div className="flex justify-between items-center px-1">
              <label className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold">Password</label>
              <Link href="/forgot-password" className="font-body text-[10px] text-gold-400/70 hover:text-gold-400 transition-colors uppercase tracking-widest font-bold">
                Forgot?
              </Link>
            </div>
            <input 
              className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
              placeholder="••••••••" 
              type="password"
              name="password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password[0]}</p>
            )}
          </div>
          <div className="pt-4">
            <SubmitButton />
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <p className="font-body text-white/50 text-sm">
            New to the mission? 
            <Link className="text-gold-400 hover:text-gold-300 hover:underline decoration-gold-400/30 underline-offset-4 ml-2 transition-all font-medium" href="/register">
              Create an Account
            </Link>
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 flex justify-center items-center space-x-6 opacity-40">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="font-body text-[10px] uppercase tracking-widest font-bold text-white">Secure Link Active</span>
        </div>
        <div className="w-px h-3 bg-white/30"></div>
        <span className="font-body text-[10px] uppercase tracking-widest font-bold text-white">&copy; {new Date().getFullYear()} Digital Heroes</span>
      </div>
    </FadeIn>
  )
}
