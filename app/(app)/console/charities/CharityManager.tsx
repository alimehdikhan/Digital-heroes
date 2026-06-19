"use client"

import { useState } from "react"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createCharity, setActiveCharity } from "@/app/actions/admin"

export function CharityManager({ initialCharities }: { initialCharities: any[] }) {
  const [charities, setCharities] = useState(initialCharities)
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', desc)
    
    const res = await createCharity(formData)
    setIsSubmitting(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Charity added to ledger." })
      setIsAdding(false)
      setName("")
      setDesc("")
      // Normally we'd fetch again or optimistic update. A full page reload is simple.
      window.location.reload()
    }
  }

  const handleSetActive = async (id: string) => {
    const res = await setActiveCharity(id)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: "Active charity updated." })
      setCharities(charities.map(c => ({
        ...c,
        is_active: c.id === id
      })))
    }
  }

  return (
    <div className="space-y-8">
      {/* Main Action */}
      {!isAdding ? (
        <FadeIn delay={0.2} className="flex justify-center max-w-md mx-auto">
          <Button onClick={() => setIsAdding(true)} className="w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-gold-glow flex items-center justify-center gap-3 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-navy-950 border-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            Add New Initiative
          </Button>
        </FadeIn>
      ) : (
        <FadeIn className="glass-card p-6 rounded-2xl max-w-lg mx-auto">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Charity Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary bg-gold-400 hover:bg-gold-500 text-navy-950">{isSubmitting ? 'Saving...' : 'Save Initiative'}</Button>
            </div>
          </form>
        </FadeIn>
      )}

      {/* Active Initiatives Grid */}
      <section className="space-y-8">
        <FadeIn delay={0.3} className="flex items-end justify-between">
          <h3 className="font-display text-3xl md:text-4xl text-white font-bold">Initiatives Ledger</h3>
        </FadeIn>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {charities.map((charity, i) => (
            <StaggerItem key={charity.id}>
              <CharityItem charity={charity} onSetActive={handleSetActive} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  )
}

function CharityItem({ charity, onSetActive }: { charity: any, onSetActive: (id: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(charity.name)
  const [desc, setDesc] = useState(charity.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { updateCharity } = await import('@/app/actions/admin')
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', desc)
      const res = await updateCharity(charity.id, formData)
      
      if (res.error) throw new Error(res.error)
      toast({ title: "Success", description: "Initiative updated." })
      window.location.reload()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this initiative?")) return
    try {
      const { deleteCharity } = await import('@/app/actions/admin')
      const res = await deleteCharity(charity.id)
      if (res.error) throw new Error(res.error)
      toast({ title: "Success", description: "Initiative removed." })
      window.location.reload()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  if (isEditing) {
    return (
      <div className="glass-card p-6 rounded-2xl h-full border border-gold-400/30">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Charity Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary bg-gold-400 hover:bg-gold-500 text-navy-950">{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={`glass-card rounded-2xl overflow-hidden flex flex-col h-full group transition-all border ${charity.is_active ? 'border-emerald-400/50 shadow-emerald-glow' : 'border-white/5 hover:border-emerald-400/30'}`}>
      <div className="h-24 overflow-hidden relative bg-navy-900 border-b border-white/5 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        <div className="absolute top-4 right-4 bg-navy-950/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${charity.is_active ? 'text-emerald-400' : 'text-white/40'}`}>
            {charity.is_active ? 'Active Target' : 'Inactive'}
          </span>
        </div>
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="p-1.5 bg-navy-950/80 rounded-md border border-white/10 text-white/50 hover:text-gold-400 hover:border-gold-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          {!charity.is_active && (
            <button onClick={handleDelete} className="p-1.5 bg-navy-950/80 rounded-md border border-white/10 text-white/50 hover:text-red-400 hover:border-red-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          )}
        </div>
      </div>
      <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display text-2xl text-white font-bold mb-2">{charity.name}</h4>
          <p className="text-white/50 font-body text-sm line-clamp-2">{charity.description}</p>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="font-body text-[10px] uppercase font-bold tracking-widest text-white/50">Total Contributed</span>
            <span className="font-display text-xl text-gold-400 font-bold">${Number(charity.total_contributed || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          {!charity.is_active && (
            <Button onClick={() => onSetActive(charity.id)} variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold border-white/10 text-emerald-400 hover:bg-emerald-400/10">
              Set as Active Target
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
