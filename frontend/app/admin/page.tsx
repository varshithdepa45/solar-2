"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users, BarChart3, Cpu, Activity, TrendingUp, TrendingDown,
  ArrowUpRight, AlertCircle, CheckCircle, Clock, Globe,
  Server, Zap, Database, RefreshCcw,
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

const userGrowth = [
  { month: "Nov", users: 3200, active: 2400 },
  { month: "Dec", users: 3800, active: 2900 },
  { month: "Jan", users: 4600, active: 3500 },
  { month: "Feb", users: 5200, active: 3900 },
  { month: "Mar", users: 6100, active: 4600 },
  { month: "Apr", users: 7400, active: 5500 },
]

const apiUsage = [
  { day: "Mon", calls: 14200, errors: 120 },
  { day: "Tue", calls: 18500, errors: 95 },
  { day: "Wed", calls: 22100, errors: 210 },
  { day: "Thu", calls: 19800, errors: 88 },
  { day: "Fri", calls: 24300, errors: 145 },
  { day: "Sat", calls: 16700, errors: 72 },
  { day: "Sun", calls: 12400, errors: 55 },
]

const modelMetrics = [
  { hour: "00:00", latency: 280, accuracy: 97.2 },
  { hour: "04:00", latency: 245, accuracy: 97.8 },
  { hour: "08:00", latency: 420, accuracy: 96.9 },
  { hour: "12:00", latency: 510, accuracy: 97.4 },
  { hour: "16:00", latency: 488, accuracy: 97.1 },
  { hour: "20:00", latency: 365, accuracy: 97.6 },
]

const projectStats = [
  { region: "West Coast", projects: 1840, color: "oklch(0.72 0.2 200)" },
  { region: "East Coast", projects: 1420, color: "oklch(0.75 0.22 150)" },
  { region: "Midwest", projects: 980, color: "oklch(0.72 0.2 200 / 0.6)" },
  { region: "South", projects: 1100, color: "oklch(0.75 0.22 150 / 0.6)" },
  { region: "Europe", projects: 640, color: "oklch(0.65 0.18 260)" },
  { region: "Asia Pacific", projects: 820, color: "oklch(0.65 0.18 260 / 0.7)" },
]

const systemHealth = [
  { name: "AI Inference API", status: "operational", latency: "245ms", uptime: "99.98%" },
  { name: "Roof Detection Model", status: "operational", latency: "388ms", uptime: "99.95%" },
  { name: "Solar Estimation Engine", status: "degraded", latency: "1.2s", uptime: "98.40%" },
  { name: "Image Processing Queue", status: "operational", latency: "120ms", uptime: "99.99%" },
  { name: "Report Generator", status: "operational", latency: "890ms", uptime: "99.91%" },
  { name: "Database Cluster", status: "operational", latency: "18ms", uptime: "100.00%" },
]

const recentActivity = [
  { user: "sarah.chen@sunteched.com", action: "Completed roof analysis", project: "Marina District Complex", time: "2m ago" },
  { user: "admin@greenfield.edu", action: "Downloaded report", project: "Greenfield School Campus", time: "8m ago" },
  { user: "m.williams@econsult.io", action: "Upgraded to Pro plan", project: "—", time: "15m ago" },
  { user: "priya.s@residential.co", action: "Initiated solar estimation", project: "Sunset Villas Block D", time: "22m ago" },
  { user: "derek.f@harborcorp.com", action: "API key generated", project: "Harbor View API", time: "35m ago" },
]

const statusStyle: Record<string, string> = {
  operational: "text-neon-green bg-neon-green/10 border-neon-green/20",
  degraded: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  down: "text-red-400 bg-red-400/10 border-red-400/20",
}
const statusDot: Record<string, string> = {
  operational: "bg-neon-green",
  degraded: "bg-yellow-400",
  down: "bg-red-400",
}

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />

      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 glass border-b border-white/5 px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Platform analytics & system monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            {["24h", "7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === r
                    ? "bg-neon-blue/15 text-neon-blue border border-neon-blue/30"
                    : "glass border border-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
            <button className="p-2 rounded-lg glass border border-white/5 text-muted-foreground hover:text-foreground transition-all ml-1">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-w-7xl mx-auto">
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Total Users", value: "7,420", delta: "+21%", up: true, sub: "vs last month", color: "neon-blue" },
              { icon: Activity, label: "API Calls Today", value: "24,300", delta: "+15%", up: true, sub: "2.4M this month", color: "neon-green" },
              { icon: BarChart3, label: "Projects Analyzed", value: "6,800", delta: "+34%", up: true, sub: "all time", color: "neon-blue" },
              { icon: Cpu, label: "Model Accuracy", value: "97.4%", delta: "-0.2%", up: false, sub: "rolling 7-day avg", color: "neon-green" },
            ].map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass rounded-2xl p-5 border border-white/5 hover:border-neon-blue/15 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color === "neon-blue" ? "bg-neon-blue/10 border border-neon-blue/20" : "bg-neon-green/10 border border-neon-green/20"}`}>
                      <Icon className={`w-4 h-4 ${m.color === "neon-blue" ? "text-neon-blue" : "text-neon-green"}`} />
                    </div>
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${m.up ? "text-neon-green" : "text-red-400"}`}>
                      {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {m.delta}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{m.sub}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* User growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">User Growth</h3>
                  <p className="text-xs text-muted-foreground">Total vs active users</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-neon-blue" />Total</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-neon-green" />Active</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={userGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ugBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.2 200)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.72 0.2 200)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ugGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.75 0.22 150)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="oklch(0.75 0.22 150)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 240)" />
                  <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.12 0.02 240 / 0.95)", border: "1px solid oklch(0.25 0.025 240)", borderRadius: "12px", fontSize: "12px", color: "oklch(0.95 0.01 220)" }} />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke="oklch(0.72 0.2 200)" strokeWidth={2} fill="url(#ugBlue)" />
                  <Area type="monotone" dataKey="active" name="Active Users" stroke="oklch(0.75 0.22 150)" strokeWidth={2} fill="url(#ugGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* API usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">API Usage</h3>
                  <p className="text-xs text-muted-foreground">Calls & errors — last 7 days</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-neon-blue" />Calls</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-red-400" />Errors</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={apiUsage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 240)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.12 0.02 240 / 0.95)", border: "1px solid oklch(0.25 0.025 240)", borderRadius: "12px", fontSize: "12px", color: "oklch(0.95 0.01 220)" }} />
                  <Bar dataKey="calls" name="API Calls" fill="oklch(0.72 0.2 200)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="errors" name="Errors" fill="oklch(0.577 0.245 27 / 0.7)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Model monitoring + project stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Model monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">Model Monitoring</h3>
                  <p className="text-xs text-muted-foreground">Latency (ms) & accuracy — today</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-neon-blue" />Latency</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-neon-green" />Accuracy %</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={modelMetrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 240)" />
                  <XAxis dataKey="hour" tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[95, 100]} tick={{ fill: "oklch(0.55 0.02 230)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.12 0.02 240 / 0.95)", border: "1px solid oklch(0.25 0.025 240)", borderRadius: "12px", fontSize: "12px", color: "oklch(0.95 0.01 220)" }} />
                  <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency (ms)" stroke="oklch(0.72 0.2 200)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="oklch(0.75 0.22 150)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Regional projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-neon-blue" />
                <h3 className="font-bold text-foreground">Projects by Region</h3>
              </div>
              <div className="space-y-3">
                {projectStats.map((r) => (
                  <div key={r.region}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{r.region}</span>
                      <span className="font-semibold text-foreground">{r.projects.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.projects / 1840) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: r.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* System health + activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* System health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-neon-blue" />
                  <h3 className="font-bold text-foreground">System Health</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neon-green">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  5/6 Operational
                </div>
              </div>
              <div className="space-y-2.5">
                {systemHealth.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${statusDot[s.status]} ${s.status === "operational" ? "animate-pulse" : ""}`} />
                      <div>
                        <p className="text-sm text-foreground font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.latency} avg latency · {s.uptime} uptime</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-neon-blue" />
                  <h3 className="font-bold text-foreground">Recent Activity</h3>
                </div>
                <button className="text-xs text-neon-blue hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-neon-blue">
                      {a.user[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{a.user}</p>
                      <p className="text-xs text-muted-foreground">{a.action}</p>
                      {a.project !== "—" && (
                        <p className="text-xs text-neon-blue/70 truncate">{a.project}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {a.time}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
