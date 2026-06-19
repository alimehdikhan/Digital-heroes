"use client"

import { useState } from "react"
import { FadeIn, SlideUp } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deleteScore, updateScore } from "@/app/actions/admin"

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState<number>(0)
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

  const handleUpdate = async (id: string) => {
    const res = await updateScore(id, editVal)
    if (res.error) {
      toast({ title: "Action Failed", description: res.error, variant: "destructive" })
    } else {
      setScores(prev => prev.map(s => s.id === id ? { ...s, score: editVal } : s))
      setEditingId(null)
      toast({ title: "Score Updated", description: "The score was successfully altered." })
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
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-navy-900 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-gold-400 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <div className="text-white font-bold">{s.profiles?.name || 'Unknown Hero'}</div>
                        <div className="text-white/50 text-xs mt-1">ID: {s.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {editingId === s.id ? (
                      <div className="flex gap-2 items-center">
                        <input type="number" min="1" max="45" value={editVal} onChange={e => setEditVal(Number(e.target.value))} className="w-16 bg-navy-900 border border-white/10 text-white px-2 py-1 rounded" />
                        <Button size="sm" onClick={() => handleUpdate(s.id)} className="h-7 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[10px] text-white/50">Cancel</Button>
                      </div>
                    ) : (
                      <span className="font-display text-2xl text-gold-400 font-bold">{s.score}</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white/70 font-body text-sm">
                      {new Date(s.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(s.id); setEditVal(s.score); }} className="p-2.5 rounded-xl border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all text-white/50 bg-navy-900" title="Edit Score">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2.5 rounded-xl border border-white/10 hover:border-red-400 hover:text-red-400 transition-all text-white/50 bg-navy-900" title="Invalidate Score">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
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
