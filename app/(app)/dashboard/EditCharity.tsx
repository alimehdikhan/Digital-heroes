"use client"

import { useState } from "react"
import { updateUserCharity } from "@/app/actions/user"
import { Button } from "@/components/ui/button"

export function EditCharity({ charities, currentId, currentPct }: { charities: any[], currentId: string, currentPct: number }) {
  const [charityId, setCharityId] = useState(currentId || "")
  const [pct, setPct] = useState(currentPct || 10)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('charityId', charityId)
    formData.append('charityPercentage', pct.toString())
    const res = await updateUserCharity(formData)
    setLoading(false)
    if (res.error) setMsg(res.error)
    else setMsg("Saved successfully")
    setTimeout(() => setMsg(""), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t border-white/10 pt-4">
      <h4 className="font-display text-lg text-white font-bold">Your Charity Preferences</h4>
      <div className="space-y-2">
        <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Selected Charity</label>
        <select 
          value={charityId} 
          onChange={(e) => setCharityId(e.target.value)}
          className="w-full bg-navy-900 border border-white/10 rounded px-3 py-2 text-white font-body text-sm"
        >
          <option value="">Select a charity</option>
          {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Contribution (%)</label>
          <span className="text-white text-xs font-bold">{pct}%</span>
        </div>
        <input 
          type="range" min="10" max="100" value={pct} onChange={(e) => setPct(parseInt(e.target.value))}
          className="w-full accent-emerald-400"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-emerald-400">{msg}</span>
        <Button type="submit" disabled={loading} size="sm" className="bg-white/10 text-white hover:bg-white/20 uppercase tracking-widest text-[10px] font-bold">Save</Button>
      </div>
    </form>
  )
}
