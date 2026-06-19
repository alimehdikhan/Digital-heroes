"use client"

import { useState } from "react"
import { FadeIn, SlideUp } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile } from "@/app/actions/admin"

type User = {
  id: string
  name: string
  role: string
  subscription_status: string
  subscription_plan: string | null
  created_at: string
}

export function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editPlan, setEditPlan] = useState("")
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")
  const { toast } = useToast()

  const handleUpdate = async (id: string) => {
    const res = await updateUserProfile(id, editStatus, editPlan, editName, editRole)
    if (res.error) {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    } else {
      toast({ title: "Success", description: "User profile updated." })
      setUsers(users.map(u => u.id === id ? { ...u, name: editName, role: editRole, subscription_status: editStatus, subscription_plan: editPlan === 'none' ? null : editPlan } : u))
      setEditingId(null)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    
    if (filter === "All") return true
    if (filter === "Active" && u.subscription_status === "active") return true
    if (filter === "Inactive" && u.subscription_status !== "active") return true
    if (filter === "Admin" && u.role === "admin") return true
    return false
  })

  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <FadeIn delay={0.2}>
        <div className="glass-card rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-white/5 focus-within:shadow-emerald-glow focus-within:border-emerald-400/30 transition-all">
          <div className="relative flex-grow w-full md:w-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-navy-900/50 border-none rounded-xl py-4 pl-16 pr-6 text-white focus:ring-0 placeholder:text-white/30 transition-all font-body outline-none" 
              placeholder="Search by name or ID..." 
              type="text"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2">
            {['All', 'Active', 'Inactive', 'Admin'].map(f => (
              <Button 
                key={f} 
                onClick={() => setFilter(f)}
                variant="outline" 
                className={`h-12 px-6 rounded-xl ${filter === f ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/50' : 'bg-white/5 text-white/70 border-white/10 hover:border-emerald-400/50 hover:text-emerald-400'} transition-all whitespace-nowrap font-body uppercase font-bold tracking-widest text-[10px]`}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Data Table Section */}
      <FadeIn delay={0.4} className="glass-card rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">User</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Status / Role</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Subscription</th>
                <th className="px-8 py-6 font-body text-[10px] text-emerald-400 font-bold tracking-widest uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-white/50 font-body">No users found matching criteria.</td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    {editingId === user.id ? (
                      <div className="flex flex-col gap-2">
                        <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="bg-navy-900 border border-white/10 text-white text-xs p-1 rounded w-full" placeholder="Name" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-navy-900 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-gold-400 transition-colors uppercase font-display font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold">{user.name}</div>
                          <div className="text-white/50 text-xs mt-1">ID: {user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {editingId === user.id ? (
                      <div className="flex flex-col gap-2">
                        <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} className="bg-navy-900 border border-white/10 text-white text-xs p-1 rounded">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="past_due">Past Due</option>
                        </select>
                        <select value={editRole} onChange={e=>setEditRole(e.target.value)} className="bg-navy-900 border border-white/10 text-white text-xs p-1 rounded mt-1">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${user.subscription_status === 'active' ? 'bg-emerald-400/10 border-emerald-400/30' : 'bg-white/5 border-white/20'}`}>
                          {user.subscription_status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                          <span className={`font-display text-sm font-bold ${user.subscription_status === 'active' ? 'text-emerald-400' : 'text-white/50'}`}>
                            {user.subscription_status}
                          </span>
                        </div>
                        <span className="text-white/70 text-xs font-bold uppercase tracking-widest">{user.role}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {editingId === user.id ? (
                      <div className="flex flex-col gap-2">
                        <select value={editPlan} onChange={e=>setEditPlan(e.target.value)} className="bg-navy-900 border border-white/10 text-white text-xs p-1 rounded">
                          <option value="none">None</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    ) : (
                      <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase ${user.subscription_plan === 'yearly' ? 'border-gold-400/40 bg-gold-400/10 text-gold-400' : 'border-white/20 bg-white/5 text-white/70'}`}>
                        {user.subscription_plan || 'None'}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {editingId === user.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => handleUpdate(user.id)} className="h-7 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-[10px] text-white/50">Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {
                          setEditingId(user.id); 
                          setEditStatus(user.subscription_status); 
                          setEditPlan(user.subscription_plan || 'none');
                          setEditName(user.name);
                          setEditRole(user.role);
                        }} className="p-2.5 rounded-xl border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all text-white/50 bg-navy-900" title="Edit User">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 border-t border-white/10 flex justify-between items-center bg-white/5">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Showing {filteredUsers.length} Users</span>
        </div>
      </FadeIn>
    </div>
  )
}
