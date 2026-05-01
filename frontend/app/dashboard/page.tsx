"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun, TrendingUp, DollarSign, Zap, Upload, Bell,
  Search, ArrowUpRight, ArrowDownRight, Battery, Thermometer,
  LayoutGrid, List, Filter, Wifi, WifiOff
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { cn } from "@/lib/utils"
import { getHealthStatus } from "@/lib/api"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from "recharts"

const energyData = [
  { month: "Jan", produced: 320, consumed: 280, saved: 40 },
  { month: "Feb", produced: 380, consumed: 300, saved: 80 },
  { month: "Mar", produced: 520, consumed: 320, saved: 200 },
  { month: "Apr", produced: 680, consumed: 340, saved: 340 },
  { month: "May", produced: 780, consumed: 360, saved: 420 },
  { month: "Jun", produced: 850, consumed: 380, saved: 470 },
  { month: "Jul", produced: 900, consumed: 370, saved: 530 },
  { month: "Aug", produced: 860, consumed: 355, saved: 505 },
  { month: "Sep", produced: 700, consumed: 345, saved: 355 },
  { month: "Oct", produced: 540, consumed: 330, saved: 210 },
  { month: "Nov", produced: 380, consumed: 310, saved: 70 },
  { month: "Dec", produced: 290, consumed: 290, saved: 0 },
]

const recentProjects = [
  { name: "Oak Street Residence", status: "Completed", panels: 24, savings: "$1,840/yr", date: "Apr 28, 2026" },
  { name: "Maple Business Park", status: "In Progress", panels: 120, savings: "$14,200/yr", date: "Apr 27, 2026" },
  { name: "Sunset Villas Block B", status: "Pending", panels: 60, savings: "$7,100/yr", date: "Apr 25, 2026" },
  { name: "Greenfield School", status: "Completed", panels: 200, savings: "$28,000/yr", date: "Apr 22, 2026" },
]

const aiInsights = [
  { type: "Optimization", msg: "Panel array 3B is underperforming by 8%. Recommended: Schedule cleaning.", severity: "warning" },
  { type: "Forecast", msg: "Expected 15% higher output next week due to clear weather conditions.", severity: "info" },
]

const statusColors: Record<string, string> = {
  Completed: "text-neon-green border-neon-green/30 bg-neon-green/5",
  "In Progress": "text-neon-blue border-neon-blue/30 bg-neon-blue/5",
  Pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-4 border border-white/10 text-xs shadow-2xl">
        <p className="text-muted-foreground mb-2 font-bold uppercase tracking-widest">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <p className="font-semibold" style={{ color: p.color }}>
              {p.name}: {p.value} kWh
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    output: "0.0 kW",
    yield: "0.0 kWh",
    savings: "$0",
    efficiency: "0.0%"
  })
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [modelsLoaded, setModelsLoaded] = useState<number>(0)

  // Check backend health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await getHealthStatus()
        setBackendStatus(health.status === "ok" ? "online" : "offline")
        setModelsLoaded(health.models_loaded?.length ?? 0)
      } catch {
        setBackendStatus("offline")
      }
    }
    checkHealth()
    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem('solar_analysis_results') || '{}')
      if (saved.roof_area_sqm) {
        setStats({
          output: `${(saved.estimated_capacity_kw || 0).toFixed(1)} kW`,
          yield: `${(saved.estimated_capacity_kw * 4.2 || 0).toFixed(1)} kWh`,
          savings: `$${Math.round(saved.estimated_capacity_kw * 15)}`,
          efficiency: "94.2%"
        })
      }
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const dynamicMetrics = [
    { label: "Current Output", value: stats.output, delta: "+12%", up: true, icon: Zap, color: "neon-blue" },
    { label: "Today's Yield", value: stats.yield, delta: "+8%", up: true, icon: Sun, color: "neon-green" },
    { label: "Monthly Savings", value: stats.savings, delta: "+21%", up: true, icon: DollarSign, color: "neon-blue" },
    { label: "Efficiency", value: stats.efficiency, delta: "-0.3%", up: false, icon: Battery, color: "neon-green" },
  ]

  return (
    <div className="min-h-screen bg-background flex selection:bg-neon-blue/30 selection:text-white">
      <DashboardSidebar />

      <main className="flex-1 ml-64 min-h-screen">
        {/* Billion Dollar Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">System Command Center</h1>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                backendStatus === "checking" ? "bg-yellow-400" : backendStatus === "online" ? "bg-neon-green" : "bg-red-400"
              )} />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {backendStatus === "checking"
                  ? "Neural Link: Connecting..."
                  : backendStatus === "online"
                  ? `Neural Link: Online • ${modelsLoaded} Model${modelsLoaded !== 1 ? "s" : ""} Active`
                  : "Neural Link: Backend Offline — Run python run.py"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {backendStatus === "offline" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <WifiOff className="w-3 h-3" /> Backend Offline
              </div>
            )}
            {backendStatus === "online" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-black uppercase tracking-widest">
                <Wifi className="w-3 h-3" /> API Online
              </div>
            )}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-neon-blue" />
              <input
                type="text"
                placeholder="Search global assets..."
                className="glass rounded-2xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-white/5 focus:outline-none focus:border-neon-blue/40 w-64 transition-all"
              />
            </div>
            <button className="relative p-2.5 rounded-2xl glass border border-white/5 hover:border-neon-blue/30 transition-all group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-neon-blue transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-blue glow-blue border-2 border-background" />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto page-transition">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicMetrics.map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="glass rounded-3xl p-6 border border-white/5 hover:border-neon-blue/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 blur-3xl -mr-16 -mt-16 group-hover:bg-neon-blue/10 transition-all" />
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      m.color === "neon-blue" ? "bg-neon-blue/10 border border-neon-blue/20 glow-blue" : "bg-neon-green/10 border border-neon-green/20 glow-green"
                    )}>
                      <Icon className={cn("w-6 h-6", m.color === "neon-blue" ? "text-neon-blue" : "text-neon-green")} />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                      m.up ? "text-neon-green border-neon-green/20 bg-neon-green/5" : "text-red-400 border-red-400/20 bg-red-400/5"
                    )}>
                      {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {m.delta}
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-24 skeleton" />
                      <div className="h-3 w-16 skeleton" />
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-foreground tracking-tight mb-1">{m.value}</p>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</p>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Core Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass rounded-[2rem] p-8 border border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Spectral Energy Flow</h3>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Real-time Production Analysis</p>
                </div>
                <div className="flex gap-4 p-1 rounded-xl bg-white/5">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-neon-blue bg-neon-blue/10">Yearly</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground">Monthly</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--neon-blue)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="produced"
                    name="Production"
                    stroke="var(--neon-blue)"
                    strokeWidth={3}
                    fill="url(#gradPrimary)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-[2rem] p-8 border border-white/5 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-8">
                <Thermometer className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-bold text-foreground">AI Neural Insights</h3>
              </div>
              <div className="space-y-4 flex-1">
                {aiInsights.map((ins, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + (i * 0.1) }}
                    className="rounded-2xl p-5 border border-white/5 bg-white/3 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue">{ins.type}</span>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-neon-blue transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">&quot;{ins.msg}&quot;</p>
                  </motion.div>
                ))}
              </div>
              <button className="mt-8 w-full py-4 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-black uppercase tracking-[0.2em] hover:bg-neon-blue/20 transition-all">
                Run Diagnostic
              </button>
            </motion.div>
          </div>

          {/* Interactive Project Engine */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-[2rem] border border-white/5 overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Active Deployment Fleet</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Satellite Analysis History</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex p-1 rounded-xl bg-white/5 mr-4">
                  <button className="p-2 rounded-lg bg-white/5 text-neon-blue"><LayoutGrid className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg text-muted-foreground"><List className="w-4 h-4" /></button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-xs font-bold text-foreground hover:border-neon-blue/30 transition-all">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                <a href="/roof-detection" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-blue text-background text-xs font-black uppercase tracking-wider hover:bg-neon-blue/90 transition-all glow-blue">
                  <Upload className="w-3.5 h-3.5" /> Deploy AI
                </a>
              </div>
            </div>
            <div className="table-container p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Identity</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arrays</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yield Savings</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p, i) => (
                    <motion.tr
                      key={p.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + (i * 0.05) }}
                      className="group border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-neon-blue transition-colors">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Sector 7-G • High Density</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border", statusColors[p.status])}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-xs font-mono text-muted-foreground">{p.panels} panels</td>
                      <td className="px-4 py-5 text-sm font-black text-neon-green tracking-tight">{p.savings}</td>
                      <td className="px-4 py-5 text-right text-xs font-semibold text-muted-foreground">{p.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
