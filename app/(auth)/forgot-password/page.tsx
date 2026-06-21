"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { FadeIn } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { forgotPassword, type ActionState } from "@/app/actions/auth"

const initialState: ActionState = { error: null, success: null, fieldErrors: {} }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button size="lg" type="submit" disabled={pending} className="w-full h-14 btn-primary rounded-xl text-navy-950 font-body uppercase tracking-[0.2em] font-black shadow-lg">
      {pending ? 'Sending...' : 'Send Reset Link'}
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPassword, initialState)

  return (
    <FadeIn delay={0.1}>
      <div className="glass-card rounded-2xl p-10 md:p-12 shadow-card relative group">
        <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="text-gold-400 mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-gold-400/10 shadow-gold-glow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="font-display text-2xl text-white tracking-tight mb-2 font-bold">Digital Heroes</h2>
          <div className="h-px w-12 bg-gold-400/30 mb-6"></div>
          <h1 className="font-display text-3xl md:text-4xl text-white italic font-bold">Reset Access</h1>
        </div>

        {state.success ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 p-6 rounded-xl text-sm font-body">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <p className="font-bold mb-2">Reset Link Sent</p>
              <p className="text-emerald-400/70">Check your email for the password reset link. It may take a few minutes to arrive.</p>
            </div>
            <Link href="/login" className="text-gold-400 hover:text-gold-300 hover:underline decoration-gold-400/30 underline-offset-4 transition-all font-medium font-body text-sm">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
            {state.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body">
                {state.error}
              </div>
            )}
            <div className="space-y-2 group/input">
              <label htmlFor="email" className="block font-body text-xs text-white/50 uppercase tracking-widest font-bold ml-1">Email Address</label>
              <input 
                className="w-full bg-navy-950/50 border border-white/10 rounded-xl px-5 py-4 text-white font-body focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all placeholder:text-white/20 group-focus-within/input:scale-[1.01]" 
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
            <p className="text-white/40 text-xs font-body text-center">
              We'll send you a secure link to reset your password.
            </p>
            <div className="pt-4">
              <SubmitButton />
            </div>
          </form>
        )}

        <div className="mt-12 text-center">
          <p className="font-body text-white/50 text-sm">
            Remember your credentials? 
            <Link className="text-gold-400 hover:text-gold-300 hover:underline decoration-gold-400/30 underline-offset-4 ml-2 transition-all font-medium" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>

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
