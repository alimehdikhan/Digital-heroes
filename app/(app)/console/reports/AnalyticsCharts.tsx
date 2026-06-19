"use client"

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"

type AnalyticsProps = {
  userGrowthData: any[]
  financialData: any[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-xl border border-white/10 shadow-xl bg-navy-900/90 backdrop-blur-xl">
        <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
            <p className="text-white font-body text-sm font-bold">
              {p.name}: <span className="font-display">{p.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsCharts({ userGrowthData, financialData }: AnalyticsProps) {
  return (
    <StaggerContainer className="space-y-8">
      <StaggerItem>
        <div className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl">
          <div className="mb-8">
            <h3 className="font-display text-2xl text-white font-bold">User Acquisition & Retention</h3>
            <p className="text-white/50 font-body text-sm mt-1">Total registered heroes vs active subscriptions.</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                <Area type="monotone" dataKey="total" name="Total Users" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="active" name="Active Subscriptions" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="glass-card rounded-[32px] p-8 border border-white/5 shadow-2xl">
          <div className="mb-8">
            <h3 className="font-display text-2xl text-white font-bold">Financial Distributions</h3>
            <p className="text-white/50 font-body text-sm mt-1">Prize pool vs mandatory charity contributions.</p>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff80', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.8 }} />
                <Bar dataKey="charity" name="Charity Contributions ($)" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="pool" name="Prize Pool ($)" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </StaggerItem>
    </StaggerContainer>
  )
}
