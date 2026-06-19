"use client"

import { useState } from "react"
import { FadeIn, SlideUp } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deleteScore } from "@/app/actions/admin"

type ScoreRecord = {
  id: string
  user_id: string
  score: number
  date: string
  notes: string | null
  profiles: {
    name: string
  } | null
}

export function ScoresTable({ initialScores }: { initialScores: ScoreRecord[] }) {
  const [search, setSearch] = useState("")
  const [scores, setScores] = useState<ScoreRecord[]>(initialScores)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to invalidate this score? It will be permanently removed from the ledger.')) return
    
    const res = await deleteScore(id)
    if (res.error) {
      toast({
        title: "Action Failed",
        description: res.error,
        variant: "destructive"
      })
    } else {
      setScores(prev => prev.filter(s => s.id !== id))
      toast({
        title: "Score Invalidated",
        description: "The fraudulent score has been removed.",
        variant: "default"
      })
    }
  }

  const filteredScores = scores.filter(s => {
    const userName = s.profiles?.name || ''
    const matchesSearch = userName.toLowerCase().includes(search.toLowerCase()) || 
                          s.score.toString().includes(search) ||
                          s.id.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <FadeIn delay={0.2}>
        <div className="glass-card rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-white/5 focus-within:shadow-emerald-glow focus-within:border-emerald-400/30 transition-all">
          <div className="relative flex-grow w-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-navy-900/50 border-none rounded-xl py-4 pl-16 pr-6 text-white focus:ring-0 placeholder:text-white/30 transition-all font-body outline-none" 
              placeholder="Search by user name, score, or ID..." 
              type="text"
            />
          </div>
        </div>
      </FadeIn>

      {/* Data Table Section */}
      <FadeIn delay={0.4} className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Hero</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Score Magnitude</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Date Transmitted</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-white/50 font-body">No scores found matching criteria.</td>
                </tr>
              )}
              {filteredScores.map((s) => (
                <ScoreRow key={s.id} score={s} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 border-t border-white/10 flex justify-between items-center bg-white/5">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Showing {filteredScores.length} Global Logs</span>
        </div>
      </FadeIn>
    </div>
  )
}

function ScoreRow({ score, onDelete }: { score: ScoreRecord, onDelete: (id: string) => void }) {
  const [val, setVal] = useState(score.score.toString())
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 1 || num > 45) {
      toast({ title: "Invalid Score", description: "Score must be between 1 and 45.", variant: "destructive" })
      return
    }

    setIsUpdating(true)
    try {
      const { updateScore } = await import('@/app/actions/admin')
      const res = await updateScore(score.id, num)
      if (res.error) throw new Error(res.error)
      toast({ title: "Success", description: "Score updated." })
      window.location.reload()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-900 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-gold-400 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div className="text-white font-bold">{score.profiles?.name || 'Unknown Hero'}</div>
            <div className="text-white/50 text-xs mt-1">ID: {score.id.substring(0, 8)}...</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <input 
          type="number" 
          min="1" 
          max="45"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-gold-400 font-display text-xl font-bold w-24 outline-none focus:border-gold-400 text-center"
        />
      </td>
      <td className="px-8 py-6">
        <span className="text-white/70 font-body text-sm">
          {new Date(score.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {parseInt(val, 10) !== score.score && !isNaN(parseInt(val, 10)) && (
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="px-3 h-10 text-[10px] btn-primary uppercase tracking-widest font-bold"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          )}
          <button onClick={() => onDelete(score.id)} className="p-2.5 rounded-xl border border-white/10 hover:border-red-400 hover:text-red-400 transition-all text-white/50 bg-navy-900" title="Invalidate Score">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
