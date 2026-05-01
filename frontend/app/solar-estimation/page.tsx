"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun, DollarSign, TrendingUp, Download, Zap, Leaf,
  ChevronRight, Info, ArrowUpRight, BarChart3, PieChart as PieChartIcon,
  Activity, ShieldCheck, Globe, Calendar, CloudSun, Wifi, WifiOff
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts"
import {
  getSolarForecast,
  getSavingsPrediction,
  type SolarForecastPayload,
  type SolarForecastResult,
  type SavingsPredictionResult,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const demoYearlySavings = [
  { year: "2026", savings: 2800, cumulative: 2800, production: 9400 },
  { year: "2027", savings: 2940, cumulative: 5740, production: 9870 },
  { year: "2028", savings: 3087, cumulative: 8827, production: 10363 },
  { year: "2029", savings: 3241, cumulative: 12068, production: 10881 },
  { year: "2030", savings: 3403, cumulative: 15471, production: 11425 },
  { year: "2031", savings: 3573, cumulative: 19044, production: 11996 },
  { year: "2032", savings: 3752, cumulative: 22796, production: 12596 },
  { year: "2033", savings: 3940, cumulative: 26736, production: 13226 },
  { year: "2034", savings: 4137, cumulative: 30873, production: 13887 },
  { year: "2035", savings: 4344, cumulative: 35217, production: 14582 },
]

const panelOptions = [
  {
    id: "premium",
    name: "Ultra-Efficient Matrix",
    wattage: "420W",
    efficiency: "22.3%",
    panels: 22,
    cost: 18700,
    annualYield: "9,400 kWh",
    brand: "Maxeon Gen 6",
    warranty: "40 Years",
  },
  {
    id: "bifacial",
    name: "Bifacial Photon-Catch",
    wattage: "450W",
    efficiency: "23.8%",
    panels: 20,
    cost: 21000,
    annualYield: "10,200 kWh",
    brand: "Jinko Tiger Neo",
    warranty: "30 Years",
  },
]

export default function SolarEstimationPage() {
  const [selectedPanel, setSelectedPanel] = useState("premium")
  const [forecastData, setForecastData] = useState<SolarForecastResult | null>(null)
  const [savingsData, setSavingsData] = useState<SavingsPredictionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const saved = JSON.parse(localStorage.getItem("solar_analysis_results") || "{}")
        const capacity: number = saved.estimated_capacity_kw || 5.0

        const forecastPayload: SolarForecastPayload = {
          latitude: 28.6139,
          longitude: 77.209,
          month: new Date().getMonth() + 1,
          day_of_year: Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
          ),
          hour: 12,
          temperature_celsius: 32.0,
          cloud_cover_pct: 15.0,
          humidity_pct: 45.0,
          wind_speed_ms: 3.0,
          ghi: 820.0,
          panel_capacity_kw: capacity,
          panel_efficiency_pct: 22.0,
          panel_tilt_degrees: 15.0,
          panel_azimuth_degrees: 180.0,
        }

        const forecast = await getSolarForecast(forecastPayload)
        setForecastData(forecast.data)
        setBackendOnline(true)

        const savings = await getSavingsPrediction({
          panel_capacity_kw: capacity,
          annual_solar_kwh: forecast.data.predicted_kwh * 365,
          electricity_rate_per_kwh: 0.15,
          export_rate_per_kwh: 0.05,
          annual_consumption_kwh: 12000,
          self_consumption_ratio: 0.7,
          installation_cost: capacity * 1500,
          annual_tariff_increase_pct: 3.0,
          panel_degradation_pct: 0.5,
          system_lifetime_years: 25,
        })
        setSavingsData(savings.data)
      } catch (err) {
        console.error("Backend fetch failed:", err)
        setBackendOnline(false)
        setError(err instanceof Error ? err.message : "Backend unreachable")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentPanel = panelOptions.find(p => p.id === selectedPanel) || panelOptions[0]
  const paybackYears = savingsData?.payback_period_years?.toFixed(1) ?? (currentPanel.cost * 0.7 / 2800).toFixed(1)
  const annualKwh = (forecastData?.predicted_kwh ?? 0) * 365
  const co2Saved = savingsData?.co2_offset_tonnes_per_year
    ? Math.round(savingsData.co2_offset_tonnes_per_year * 1000) // convert to kg
    : Math.round(annualKwh * 0.7)
  const lifetimeSavings = savingsData?.lifetime_savings_currency
    ? `$${Math.round(savingsData.lifetime_savings_currency).toLocaleString()}`
    : "$86,400"
  const irr = savingsData?.roi_pct
    ? `${((savingsData.roi_pct / 25)).toFixed(1)}%`
    : "14.2%"
  const npv = savingsData?.net_present_value
    ? `$${Math.round(savingsData.net_present_value).toLocaleString()}`
    : "$42,800"

  const projectionData = savingsData?.yearly_savings
    ? savingsData.yearly_savings
        .slice(0, 10)
        .map((row: any) => ({
          year: String(row.year),
          savings: Number(row.savings_currency ?? 0),
          cumulative: Number(row.cumulative_savings ?? 0),
        }))
    : demoYearlySavings

  return (
    <div className="min-h-screen bg-background flex selection:bg-neon-blue/30 selection:text-white">
      <DashboardSidebar />

      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-neon-blue/5 blur-[160px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-green/5 blur-[140px] rounded-full pointer-events-none opacity-50" />

        <header className="sticky top-0 z-30 glass border-b border-white/5 px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight italic">Solar Yield Forecaster</h1>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                backendOnline === null ? "bg-yellow-400" : backendOnline ? "bg-neon-green" : "bg-red-400"
              )} />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {backendOnline === null
                  ? "Connecting to Backend..."
                  : backendOnline
                  ? "Core Engine: Random Forest V4.2 • Online"
                  : "Backend Offline — Showing Demo Data"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {backendOnline === false && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <WifiOff className="w-3.5 h-3.5" />
                Start backend: python run.py
              </div>
            )}
            <button className="px-5 py-2.5 rounded-2xl glass border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-neon-blue/30 transition-all flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> Simulation Mode
            </button>
            <button className="px-6 py-2.5 rounded-2xl bg-neon-green text-background text-[10px] font-black uppercase tracking-widest glow-green hover:bg-neon-green/90 transition-all flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export PDF Matrix
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto page-transition">
          {/* Top Tier Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Neural Size", value: `${((currentPanel.panels * 420) / 1000).toFixed(1)} kWp`, sub: "22 Array Matrix", color: "neon-blue" },
              { icon: DollarSign, label: "Net Investment", value: `$${(currentPanel.cost * 0.7).toLocaleString()}`, sub: "Post-Incentive Vector", color: "neon-green" },
              { icon: Activity, label: "Payback Lock", value: `${paybackYears} Years`, sub: "Neural ROI Predictor", color: "neon-blue" },
              { icon: Leaf, label: "Carbon Neutrality", value: `${(co2Saved/1000).toFixed(1)} Tons`, sub: "Annual Offset Target", color: "neon-green" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110",
                  m.color === "neon-blue" ? "bg-neon-blue/10 border border-neon-blue/20 glow-blue" : "bg-neon-green/10 border border-neon-green/20 glow-green"
                )}>
                  <m.icon className={cn("w-6 h-6", m.color === "neon-blue" ? "text-neon-blue" : "text-neon-green")} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-foreground tracking-tighter italic">{m.value}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{m.label}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{m.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Long Term Projection */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-foreground italic uppercase tracking-tight">Decade Yield Projection</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Stochastic Cumulative Savings Model</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-blue glow-blue" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cumulative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-green glow-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Annual</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="cumG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--neon-blue)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="annG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--neon-green)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--neon-green)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "12px" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="var(--neon-blue)" strokeWidth={4} fill="url(#cumG)" animationDuration={2500} />
                  <Area type="monotone" dataKey="savings" stroke="var(--neon-green)" strokeWidth={2} fill="url(#annG)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Hardware Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="w-5 h-5 text-neon-blue" />
                <h3 className="text-lg font-bold text-foreground uppercase italic">Hardware Matrix</h3>
              </div>
              <div className="space-y-4 flex-1">
                {panelOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPanel(opt.id)}
                    className={cn(
                      "w-full text-left rounded-[1.5rem] p-6 border transition-all duration-500 group relative overflow-hidden",
                      selectedPanel === opt.id
                        ? "border-neon-blue/40 bg-neon-blue/5 neon-border-moving glow-blue"
                        : "border-white/5 bg-white/2 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedPanel === opt.id ? "text-neon-blue" : "text-muted-foreground")}>
                        {opt.brand}
                      </span>
                      {selectedPanel === opt.id && <div className="w-2 h-2 rounded-full bg-neon-blue glow-blue animate-pulse" />}
                    </div>
                    <p className="text-lg font-black text-foreground mb-4 italic leading-tight">{opt.name}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Efficiency</p>
                        <p className="text-xs font-bold text-foreground">{opt.efficiency}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Warranty</p>
                        <p className="text-xs font-bold text-foreground">{opt.warranty}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 p-5 rounded-2xl bg-neon-blue/5 border border-neon-blue/20">
                <div className="flex items-center gap-3 mb-2">
                  <CloudSun className="w-4 h-4 text-neon-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue">Environmental Impact</span>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">
                  Switching to the {currentPanel.name} offset an additional 1.2 tons of CO2 annually compared to baseline.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ROI Deep Scan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Billion-Dollar ROI Analysis</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">25-Year Life-Cycle Forecast Matrix</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Return</p>
                  <p className="text-3xl font-black text-neon-green tracking-tighter italic">
                    {savingsData ? `+${Math.round(savingsData.roi_pct)}%` : "+287%"}
                  </p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <button className="px-8 py-4 rounded-2xl bg-neon-blue text-background text-[10px] font-black uppercase tracking-[0.2em] glow-blue hover:scale-105 transition-transform">
                  Deploy Full Report
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Lifetime Savings", value: loading ? "..." : lifetimeSavings, sub: "Grid-Offset Neutral", icon: TrendingUp },
                { label: "Internal Rate (IRR)", value: loading ? "..." : irr, sub: "Risk-Adjusted Yield", icon: Activity },
                { label: "NPV / 25YR", value: loading ? "..." : npv, sub: "Net Present Value", icon: BarChart3 },
                { label: "Solar Multiplier", value: savingsData ? `${(savingsData.roi_pct / 100 + 1).toFixed(1)}x` : "3.4x", sub: "Asset Value Increase", icon: ShieldCheck }
              ].map((item, i) => (
                <div key={i} className="glass rounded-3xl p-8 border border-white/5 hover:border-neon-blue/20 transition-all group">
                  <item.icon className="w-5 h-5 text-neon-blue/40 mb-6 group-hover:text-neon-blue transition-colors" />
                  {loading ? (
                    <div className="h-8 w-24 skeleton mb-2" />
                  ) : (
                    <p className="text-3xl font-black text-foreground tracking-tighter italic mb-2">{item.value}</p>
                  )}
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
