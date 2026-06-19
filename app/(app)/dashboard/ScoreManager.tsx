"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteUserScore, updateUserScore, submitScore } from "@/app/actions/scores"
import { useToast } from "@/hooks/use-toast"
import { StaggerItem } from "@/components/ui/motion"

export function ScoreManager({ initialScores }: { initialScores: any[] }) {
  const [scores, setScores] = useState(initialScores)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState<number>(0)
  const [isAdding, setIsAdding] = useState(false)
  const [newScore, setNewScore] = useState<string>("")
  const [newDate, setNewDate] = useState<string>("")
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    const res = await deleteUserScore(id)
    if (res.error) toast({ title: "Error", description: res.error, variant: "destructive" })
    else setScores(scores.filter(s => s.id !== id))
  }

  const handleUpdate = async (id: string) => {
    const res = await updateUserScore(id, editVal)
    if (res.error) toast({ title: "Error", description: res.error, variant: "destructive" })
    else {
      setScores(scores.map(s => s.id === id ? { ...s, score: editVal } : s))
      setEditingId(null)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("score", newScore)
    formData.append("date", newDate)
    const res = await submitScore({}, formData)
    if (res.error) toast({ title: "Error", description: res.error, variant: "destructive" })
    else {
      toast({ title: "Success", description: "Score added" })
      setIsAdding(false)
      // Hard reload since submitScore redirects, but just in case:
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} size="sm" variant="outline" className="border-emerald-400/40 text-emerald-400 bg-transparent text-xs font-bold uppercase tracking-widest">
          {isAdding ? "Cancel" : "Add Score"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="glass-card p-4 flex gap-4 items-center">
          <input type="number" min="1" max="45" value={newScore} onChange={e => setNewScore(e.target.value)} required placeholder="Score (1-45)" className="bg-navy-900 border border-white/10 text-white px-3 py-2 rounded text-sm w-32" />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required className="bg-navy-900 border border-white/10 text-white px-3 py-2 rounded text-sm" />
          <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">Save</Button>
        </form>
      )}

      {scores.map((item, i) => (
        <StaggerItem key={item.id} className="glass-card rounded-xl p-5 flex items-center justify-between group hover:bg-white/5 transition-all border border-white/5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-navy-900 border-white/5 text-emerald-400 border-emerald-400/20 group-hover:bg-emerald-400/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            {editingId === item.id ? (
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="45" value={editVal} onChange={e => setEditVal(Number(e.target.value))} className="w-16 bg-navy-900 border border-white/10 text-white px-2 py-1 rounded" />
                <Button size="sm" onClick={() => handleUpdate(item.id)} className="h-7 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[10px] text-white/50">Cancel</Button>
              </div>
            ) : (
              <div>
                <p className="font-display text-xl text-white font-bold">{item.score} pts</p>
                <p className="text-[10px] text-white/40 font-body font-bold uppercase tracking-widest mt-1">{item.date}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button size="sm" variant="ghost" onClick={() => {setEditingId(item.id); setEditVal(item.score)}} className="h-8 text-xs text-gold-400">Edit</Button>
             <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 text-xs text-red-400">Delete</Button>
          </div>
        </StaggerItem>
      ))}
      {scores.length === 0 && !isAdding && (
        <div className="text-center p-8 text-white/50 font-body">No scores deployed yet.</div>
      )}
    </div>
  )
}
