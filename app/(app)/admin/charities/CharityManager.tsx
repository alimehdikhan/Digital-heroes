"use client"

import { useState } from "react"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createCharity, updateCharity, deleteCharity, setActiveCharity } from "@/app/actions/admin"

interface EventItem {
  title: string
  desc: string
  date: string
  img?: string
}

export function CharityManager({ initialCharities }: { initialCharities: any[] }) {
  const [charities, setCharities] = useState(initialCharities)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [heroImage, setHeroImage] = useState("")
  const [events, setEvents] = useState<EventItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const addEvent = () => {
    setEvents([...events, { title: "", desc: "", date: "", img: "" }])
  }

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index))
  }

  const updateEvent = (index: number, field: keyof EventItem, value: string) => {
    const updated = [...events]
    updated[index] = { ...updated[index], [field]: value }
    setEvents(updated)
  }

  const resetForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setName("")
    setDesc("")
    setHeroImage("")
    setEvents([])
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', desc)
    formData.append('hero_image_url', heroImage)
    formData.append('events', JSON.stringify(events.filter(ev => ev.title && ev.desc)))
    
    const res = editingId 
      ? await updateCharity(editingId, formData)
      : await createCharity(formData)
      
    setIsSubmitting(false)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: editingId ? "Charity updated." : "Charity added to ledger." })
      resetForm()
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this charity?')) return
    const res = await deleteCharity(id)
    if (res.error) toast({ title: "Error", description: res.error, variant: "destructive" })
    else {
      toast({ title: "Success", description: "Charity deleted." })
      setCharities(charities.filter(c => c.id !== id))
    }
  }

  const startEdit = (charity: any) => {
    setIsAdding(true)
    setEditingId(charity.id)
    setName(charity.name)
    setDesc(charity.description || "")
    setHeroImage(charity.hero_image_url || "")
    setEvents(Array.isArray(charity.events) ? charity.events : [])
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
      {!isAdding ? (
        <FadeIn delay={0.2} className="flex justify-center max-w-md mx-auto">
          <Button onClick={() => setIsAdding(true)} className="w-full h-16 rounded-xl font-body font-black uppercase tracking-[0.2em] text-sm transition-all shadow-gold-glow flex items-center justify-center gap-3 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-navy-950 border-none">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            Add New Initiative
          </Button>
        </FadeIn>
      ) : (
        <FadeIn className="glass-card p-6 rounded-2xl max-w-lg mx-auto w-full">
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Charity Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Hero Image URL</label>
              <input value={heroImage} onChange={e=>setHeroImage(e.target.value)} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full bg-navy-900/50 border border-white/10 rounded-xl p-3 text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Events & Field Reports</label>
              <div className="space-y-3 mt-2">
                {events.map((ev, i) => (
                  <div key={i} className="bg-navy-900/30 border border-white/10 rounded-xl p-4 space-y-3 relative">
                    <button type="button" onClick={() => removeEvent(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs">✕</button>
                    <input value={ev.title} onChange={e => updateEvent(i, 'title', e.target.value)} placeholder="Event title" className="w-full bg-navy-900/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                    <input value={ev.date} onChange={e => updateEvent(i, 'date', e.target.value)} placeholder="Date (e.g. Mar 2026)" className="w-full bg-navy-900/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                    <textarea value={ev.desc} onChange={e => updateEvent(i, 'desc', e.target.value)} placeholder="Description" rows={2} className="w-full bg-navy-900/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                    <input value={ev.img || ''} onChange={e => updateEvent(i, 'img', e.target.value)} placeholder="Image URL (optional)" className="w-full bg-navy-900/50 border border-white/10 rounded-lg p-2 text-white text-sm" />
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-white/40 text-xs font-body">No events added yet. Click below to add field reports.</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={addEvent} className="text-[10px] uppercase tracking-widest font-bold border-white/10 text-emerald-400 hover:bg-emerald-400/10">
                  + Add Event
                </Button>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary bg-gold-400 hover:bg-gold-500 text-navy-950">{isSubmitting ? 'Saving...' : 'Save Initiative'}</Button>
            </div>
          </form>
        </FadeIn>
      )}

      <section className="space-y-8">
        <FadeIn delay={0.3} className="flex items-end justify-between">
          <h3 className="font-display text-3xl md:text-4xl text-white font-bold">Initiatives Ledger</h3>
        </FadeIn>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32 md:pb-8">
          {charities.map((charity, i) => (
            <StaggerItem key={i} className={`glass-card rounded-2xl overflow-hidden flex flex-col group transition-all border ${charity.is_active ? 'border-emerald-400/50 shadow-emerald-glow' : 'border-white/5 hover:border-emerald-400/30'}`}>
              <div className="h-40 overflow-hidden relative border-b border-white/5">
                <img 
                  src={charity.hero_image_url || (charity.name.toLowerCase().includes('cancer') ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070' : charity.name.toLowerCase().includes('golf') ? 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070' : charity.name.toLowerCase().includes('children') ? 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064' : 'https://images.unsplash.com/photo-1593113565214-80afcb4a4771?q=80&w=2069')} 
                  alt={charity.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-navy-950/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 z-10">
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${charity.is_active ? 'text-emerald-400' : 'text-white/40'}`}>
                    {charity.is_active ? 'Active Target' : 'Inactive'}
                  </span>
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
                    <span className="font-display text-xl text-gold-400 font-bold">₹{Number(charity.total_contributed || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex gap-2 w-full mt-4">
                    <Button onClick={() => startEdit(charity)} variant="outline" className="flex-1 text-[10px] uppercase tracking-widest font-bold border-white/10 text-gold-400 hover:bg-gold-400/10">Edit</Button>
                    <Button onClick={() => handleDelete(charity.id)} variant="outline" className="flex-1 text-[10px] uppercase tracking-widest font-bold border-white/10 text-red-400 hover:bg-red-400/10">Delete</Button>
                  </div>
                  {!charity.is_active && (
                    <Button onClick={() => handleSetActive(charity.id)} variant="outline" className="w-full text-[10px] uppercase tracking-widest font-bold border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 mt-2">
                      Set as Active Target
                    </Button>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </div>
  )
}
