"use client"

import { useState } from "react"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createOrganization, updateOrganization } from "@/app/actions/orgs"

export function OrgManager({ initialOrgs }: { initialOrgs: any[] }) {
  const [orgs, setOrgs] = useState(initialOrgs)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [billingEmail, setBillingEmail] = useState("")
  const [plan, setPlan] = useState("team")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('billingEmail', billingEmail)
    formData.append('plan', plan)

    const res = editingId
      ? await updateOrganization(editingId, formData)
      : await createOrganization(formData)

    setIsSubmitting(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: editingId ? "Organization updated." : "Organization created." })
      setIsAdding(false)
      setEditingId(null)
      setName("")
      setSlug("")
      setBillingEmail("")
      setPlan("team")
      window.location.reload()
    }
  }

  const startEdit = (org: any) => {
    setIsAdding(true)
    setEditingId(org.id)
    setName(org.name)
    setSlug(org.slug || "")
    setBillingEmail(org.billing_email || "")
    setPlan(org.plan || "team")
  }

  return (
    <div className="space-y-8">
      {!isAdding ? (
        <FadeIn delay={0.2} className="flex justify-center max-w-md mx-auto">
          <Button onClick={() => setIsAdding(true)} className="w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-gold-glow flex items-center justify-center gap-3 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-navy-950 border-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            Create Organization
          </Button>
        </FadeIn>
      ) : (
        <FadeIn className="glass-card p-6 rounded-2xl max-w-lg mx-auto w-full">
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Organization Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Slug</label>
              <input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" placeholder="Auto-generated from name if empty" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Billing Email</label>
              <input type="email" value={billingEmail} onChange={e=>setBillingEmail(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Plan</label>
              <select value={plan} onChange={e=>setPlan(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1">
                <option value="team">Team</option>
                <option value="corporate">Corporate</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={() => {setIsAdding(false); setEditingId(null); setName(""); setSlug(""); setBillingEmail(""); setPlan("team")}} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary bg-gold-400 hover:bg-gold-500 text-navy-950">{isSubmitting ? 'Saving...' : 'Save Organization'}</Button>
            </div>
          </form>
        </FadeIn>
      )}

      <section className="space-y-6">
        <FadeIn delay={0.3}>
          <h3 className="font-display text-3xl md:text-4xl text-white font-bold">Organization Roster</h3>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-32 md:pb-8">
          {orgs.map((org, i) => (
            <StaggerItem key={i} className={`glass-card rounded-2xl p-8 border ${org.is_active ? 'border-emerald-400/30' : 'border-white/5'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-display text-2xl text-white font-bold">{org.name}</h4>
                  <p className="text-white/50 text-sm font-body mt-1">@{org.slug}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  org.plan === 'enterprise' ? 'text-gold-400 border-gold-400/30 bg-gold-400/10' :
                  org.plan === 'corporate' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                  'text-white/50 border-white/20'
                }`}>
                  {org.plan}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${org.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`}></div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">{org.is_active ? 'Active' : 'Inactive'}</span>
                {org.billing_email && (
                  <>
                    <span className="text-white/20 mx-1">•</span>
                    <span className="text-[10px] text-white/50">{org.billing_email}</span>
                  </>
                )}
              </div>
              <Button onClick={() => startEdit(org)} variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold border-white/10 text-gold-400 hover:bg-gold-400/10">
                Edit
              </Button>
            </StaggerItem>
          ))}
          {orgs.length === 0 && (
            <div className="md:col-span-2 text-center p-12 text-white/50 font-body glass-card rounded-2xl">
              No organizations yet. Create your first team or corporate account.
            </div>
          )}
        </StaggerContainer>
      </section>
    </div>
  )
}
