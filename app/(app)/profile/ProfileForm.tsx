"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { updateProfile, type ProfileActionState } from "@/app/actions/profile"
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/pricing"

const initialState: ProfileActionState = { error: null, success: null, fieldErrors: {} }

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="btn-primary px-8 h-12 uppercase tracking-widest font-black shadow-lg shadow-gold-glow/20"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  )
}

export function ProfileForm({ defaultName, email, defaultCurrency, defaultCountry }: { defaultName: string; email: string; defaultCurrency?: string; defaultCountry?: string }) {
  const [state, formAction] = useActionState(updateProfile, initialState)

  return (
    <form action={formAction}>
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-body mb-6">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 p-3 rounded-xl text-sm font-body mb-6">
          {state.success}
        </div>
      )}

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StaggerItem className="space-y-3">
          <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1">Display Name</label>
          <input 
            type="text"
            name="name"
            defaultValue={defaultName}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-4 text-white font-body focus:border-gold-400 focus:ring-1 focus:ring-gold-400/20 transition-all outline-none" 
          />
          {state.fieldErrors?.name && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.name[0]}</p>}
        </StaggerItem>
        <StaggerItem className="space-y-3">
          <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1">Email Identity</label>
          <input 
            type="email" 
            readOnly
            defaultValue={email}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-4 text-white/50 font-body outline-none cursor-not-allowed" 
          />
        </StaggerItem>
        <StaggerItem className="space-y-3">
          <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1">Preferred Currency</label>
          <select
            name="currency"
            defaultValue={defaultCurrency || DEFAULT_CURRENCY}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-4 text-white font-body focus:border-gold-400 focus:ring-1 focus:ring-gold-400/20 transition-all outline-none appearance-none cursor-pointer"
          >
            {Object.entries(CURRENCIES).map(([code, config]) => (
              <option key={code} value={code}>{config.symbol} {code} ({config.locale})</option>
            ))}
          </select>
        </StaggerItem>
        <StaggerItem className="space-y-3">
          <label className="block font-body text-xs text-white/50 uppercase font-bold tracking-widest ml-1">Country Code</label>
          <select
            name="countryCode"
            defaultValue={defaultCountry || 'IN'}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-4 text-white font-body focus:border-gold-400 focus:ring-1 focus:ring-gold-400/20 transition-all outline-none appearance-none cursor-pointer"
          >
            {['IN', 'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'JP', 'SG', 'AE'].map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <SaveButton />
        </StaggerItem>
      </StaggerContainer>
    </form>
  )
}
