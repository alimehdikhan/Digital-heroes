"use client"

import { useState } from "react"
import { FadeIn, SlideUp } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"

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

  const filteredUsers = initialUsers.filter(u => {
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
                <UserRow key={user.id} user={user} />
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

function UserRow({ user }: { user: User }) {
  const [status, setStatus] = useState(user.subscription_status)
  const [plan, setPlan] = useState(user.subscription_plan || 'none')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const { updateUserProfile } = await import('@/app/actions/admin')
      await updateUserProfile(user.id, status, plan, user.name, user.role)
      // Optional: Add toast notification here
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-900 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-gold-400 transition-colors uppercase font-display font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="text-white font-bold">{user.name}</div>
            <div className="text-white/50 text-xs mt-1">ID: {user.id.substring(0, 8)}...</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-navy-900 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-body outline-none focus:border-emerald-400"
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
          </select>
          <span className="text-white/70 text-xs font-bold uppercase tracking-widest ml-2">{user.role}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <select 
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="bg-navy-900 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-body outline-none focus:border-gold-400"
        >
          <option value="none">None</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {(status !== user.subscription_status || plan !== (user.subscription_plan || 'none')) && (
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="px-3 h-8 text-[10px] btn-primary uppercase tracking-widest font-bold"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          )}
          <button className="p-2 rounded-lg border border-white/10 hover:border-red-400 hover:text-red-400 transition-all text-white/50 bg-navy-900" title="Suspend user">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
