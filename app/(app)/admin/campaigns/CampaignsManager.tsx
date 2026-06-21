'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/motion'
import { createCampaign, updateCampaign, deleteCampaign } from '@/app/actions/campaigns'
import { useToast } from '@/hooks/use-toast'

type Campaign = {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export function CampaignsManager({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)

  const resetForm = () => {
    setName('')
    setStartDate('')
    setEndDate('')
    setIsActive(true)
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id)
    setName(campaign.name)
    setStartDate(campaign.start_date || '')
    setEndDate(campaign.end_date || '')
    setIsActive(campaign.is_active)
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('start_date', startDate)
    formData.append('end_date', endDate)
    formData.append('is_active', isActive ? 'true' : 'false')

    try {
      if (editingId) {
        const result = await updateCampaign(editingId, { success: null, error: null }, formData)
        if (result.success) {
          toast({ title: 'Updated', description: result.success })
          resetForm()
          window.location.reload()
        } else if (result.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
      } else {
        const result = await createCampaign({ success: null, error: null }, formData)
        if (result.success) {
          toast({ title: 'Campaign Created', description: result.success })
          resetForm()
          window.location.reload()
        } else if (result.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? Draws linked to it will be unlinked.')) return
    try {
      await deleteCampaign(id)
      setCampaigns((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Deleted', description: 'Campaign removed' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-white font-bold">Campaigns Ledger</h2>
        <Button
          onClick={() => { resetForm(); setIsAdding(true) }}
          className="bg-gold-400 text-navy-950 hover:bg-gold-300 font-bold text-xs uppercase tracking-widest"
        >
          + New Campaign
        </Button>
      </div>

      {isAdding && (
        <FadeIn>
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-gold-400/30 space-y-4">
            <h3 className="font-display text-lg text-gold-400 font-bold">
              {editingId ? 'Edit Campaign' : 'New Campaign'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-body">Name *</label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-body text-sm focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="hidden" name="is_active" value={isActive ? 'true' : 'false'} />
                  <div onClick={() => setIsActive(!isActive)} className={`w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-emerald-400' : 'bg-white/20'} relative`}><div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} /></div>
                  <span className="text-white/70 text-sm font-body">Active</span>
                </label>
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-body">Start Date</label>
                <input name="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-body text-sm focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-body">End Date</label>
                <input name="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-body text-sm focus:border-gold-400/50 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-gold-400 text-navy-950 hover:bg-gold-300 font-bold text-xs uppercase tracking-widest">
                {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="border-white/20 text-white/70 hover:bg-white/5 font-bold text-xs uppercase tracking-widest">
                Cancel
              </Button>
            </div>
          </form>
        </FadeIn>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
            <p className="font-display text-2xl text-white/50 font-bold">No Campaigns</p>
            <p className="font-body text-sm text-white/30 mt-1">Create a campaign to link with draw events.</p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const isUpcoming = campaign.start_date && new Date(campaign.start_date) > now
            const isEnded = campaign.end_date && new Date(campaign.end_date) < now
            return (
              <div key={campaign.id} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-lg text-white font-bold">{campaign.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${campaign.is_active ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>{campaign.is_active ? 'Active' : 'Inactive'}</span>
                    {isUpcoming && <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-gold-400/10 text-gold-400 border border-gold-400/30">Upcoming</span>}
                    {isEnded && <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-red-400/10 text-red-400 border border-red-400/30">Ended</span>}
                  </div>
                  <div className="text-sm text-white/50 mt-1 flex gap-4">
                    {campaign.start_date && <span>Starts: {campaign.start_date}</span>}
                    {campaign.end_date && <span>Ends: {campaign.end_date}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => handleEdit(campaign)} className="text-gold-400 hover:text-gold-300 text-xs">Edit</Button>
                  <Button variant="ghost" onClick={() => handleDelete(campaign.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
