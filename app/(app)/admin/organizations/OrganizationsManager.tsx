'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/motion'
import { createOrganization, updateOrganization, deleteOrganization } from '@/app/actions/organizations'
import { useToast } from '@/hooks/use-toast'

type Org = {
  id: string
  name: string
  billing_email: string | null
  created_at: string
}

export function OrganizationsManager({ initialOrganizations }: { initialOrganizations: Org[] }) {
  const [organizations, setOrganizations] = useState<Org[]>(initialOrganizations)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')

  const resetForm = () => {
    setName('')
    setBillingEmail('')
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (org: Org) => {
    setEditingId(org.id)
    setName(org.name)
    setBillingEmail(org.billing_email || '')
    setIsAdding(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('billing_email', billingEmail)

    try {
      if (editingId) {
        const result = await updateOrganization(editingId, { success: null, error: null }, formData)
        if (result.success) {
          toast({ title: 'Updated', description: result.success })
          resetForm()
          window.location.reload()
        } else if (result.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' })
        }
      } else {
        const result = await createOrganization({ success: null, error: null }, formData)
        if (result.success) {
          toast({ title: 'Team Created', description: result.success })
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
    if (!confirm('Are you sure you want to delete this organization? This will unlink all members.')) return
    try {
      await deleteOrganization(id)
      setOrganizations((prev) => prev.filter((o) => o.id !== id))
      toast({ title: 'Deleted', description: 'Organization removed' })
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-xl text-white font-bold">Organizations Ledger</h2>
        <Button
          onClick={() => { resetForm(); setIsAdding(true) }}
          className="bg-gold-400 text-navy-950 hover:bg-gold-300 font-bold text-xs uppercase tracking-widest"
        >
          + Add Team
        </Button>
      </div>

      {isAdding && (
        <FadeIn>
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl border border-gold-400/30 space-y-4">
            <h3 className="font-display text-lg text-gold-400 font-bold">
              {editingId ? 'Edit Organization' : 'New Organization'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-body">Name *</label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-body text-sm focus:border-gold-400/50 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-body">Billing Email</label>
                <input name="billing_email" type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-body text-sm focus:border-gold-400/50 focus:outline-none" />
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
        {organizations.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5">
            <p className="font-display text-2xl text-white/50 font-bold">No Organizations</p>
            <p className="font-body text-sm text-white/30 mt-1">Create a team account to get started.</p>
          </div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-display text-lg text-white font-bold">{org.name}</h4>
                <p className="text-white/40 text-xs font-body mt-1">{org.billing_email || 'No billing email'}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(org)} variant="outline" className="border-white/20 text-white/70 hover:bg-white/5 h-8 px-3 text-[10px] uppercase tracking-widest font-bold">Edit</Button>
                <Button onClick={() => handleDelete(org.id)} variant="outline" className="border-red-400/30 text-red-400 hover:bg-red-400/10 h-8 px-3 text-[10px] uppercase tracking-widest font-bold">Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
