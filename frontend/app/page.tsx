"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"
import {
  Zap, Sun, Brain, BarChart3, Shield, ArrowRight, Star,
  ChevronRight, Check, Upload, Cpu, TrendingUp, Globe,
  Activity, Layers, MousePointer2
} from "lucide-react"
import { ParticleBackground } from "@/components/particle-background"
import { TopNav } from "@/components/nav"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Brain,
    title: "Neural Roof Analysis",
    desc: "YOLOv8-powered geometry detection with sub-centimeter precision on high-res satellite assets.",
    color: "neon-blue",
  },
  {
    icon: Sun,
    title: "Irradiance Mapping",
    desc: "Generate hyper-local thermal maps considering cloud patterns, tilt, and localized shading.",
    color: "neon-green",
  },
  {
    icon: BarChart3,
    title: "ROI Forecasting",
    desc: "Deep financial simulations using Random Forest models to predict 25-year energy yields.",
    color: "neon-blue",
  },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-blue/30 selection:text-white overflow-x-hidden">
      <ParticleBackground />
      <TopNav />

      {/* Hero Section - Billion Dollar Aesthetic */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 blur-[160px] rounded-full opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-neon-green/5 blur-[140px] rounded-full opacity-30" />
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="container relative z-10 px-6 mx-auto">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 glass rounded-full px-6 py-2 border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse glow-blue" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue">Neural Network V4.2 Online</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic uppercase"
            >
              Architecting the <br />
              <span className="text-neon-blue text-glow-blue">Solar</span>{" "}
              <span className="text-neon-green text-glow-green">Future</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
            >
              Deploy advanced satellite computer vision to decode rooftop geometry and 
              generate precision solar yield matrices in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/roof-detection"
                className="group relative px-10 py-5 rounded-2xl bg-neon-blue text-background font-black uppercase tracking-[0.2em] text-xs glow-blue overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-3">
                  Initiate Analysis <ScanLine className="w-4 h-4" />
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="px-10 py-5 rounded-2xl glass border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/5 transition-all"
              >
                Global Dashboard
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
            >
              {["TESLA ENERGY", "SUNPOWER", "ENPHASE", "LG SOLAR"].map((brand) => (
                <div key={brand} className="text-sm font-black tracking-[0.4em] text-center">{brand}</div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating Scanner Visual */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-6xl pointer-events-none opacity-20"
        >
          <div className="aspect-[21/9] glass rounded-[4rem] border border-neon-blue/20 neon-border-moving overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
             <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon-blue glow-blue animate-scan" />
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 relative z-10">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-[2.5rem] p-10 border border-white/5 hover:border-neon-blue/20 transition-all group"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6",
                  f.color === "neon-blue" ? "bg-neon-blue/10 border border-neon-blue/20 glow-blue" : "bg-neon-green/10 border border-neon-green/20 glow-green"
                )}>
                  <f.icon className={cn("w-7 h-7", f.color === "neon-blue" ? "text-neon-blue" : "text-neon-green")} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">{f.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact Matrix */}
      <section className="py-32 relative overflow-hidden">
        <div className="container px-6 mx-auto relative z-10">
          <div className="glass rounded-[4rem] p-16 border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                <Globe className="w-64 h-64 text-neon-blue" />
             </div>
             <div className="max-w-2xl space-y-8">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Global Intelligence Layer</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                   Our infrastructure processes petabytes of satellite data daily to maintain the world&apos;s 
                   most accurate solar potential index.
                </p>
                <div className="grid grid-cols-2 gap-12">
                   <div>
                      <p className="text-4xl font-black text-neon-blue tracking-tighter italic">50K+</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Active Nodes</p>
                   </div>
                   <div>
                      <p className="text-4xl font-black text-neon-green tracking-tighter italic">98.4%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Core Precision</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing - Premium Cards */}
      <section className="py-32 relative z-10">
        <div className="container px-6 mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tight">Scale Your Operation</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Neural Licensing Models</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Operator", price: "49", feat: ["10 Neural Scans", "Standard Reports", "Matrix Access"] },
              { name: "Strategist", price: "149", feat: ["100 Neural Scans", "Billion-Dollar Reports", "API Access"], pro: true },
              { name: "Enterprise", price: "899", feat: ["Unlimited Scans", "White-Label Matrix", "Custom Weights"] },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass rounded-[3rem] p-12 border transition-all duration-500 hover:scale-105",
                  p.pro ? "border-neon-blue/40 neon-border-moving glow-blue" : "border-white/5"
                )}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">{p.name}</p>
                <p className="text-6xl font-black italic tracking-tighter mb-12">
                   <span className="text-lg font-bold opacity-30">$</span>{p.price}
                </p>
                <ul className="space-y-4 mb-12 text-left">
                  {p.feat.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green" /> {f}
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                  p.pro ? "bg-neon-blue text-background glow-blue" : "glass border border-white/10 hover:bg-white/5"
                )}>
                  Select Protocol
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 relative z-10">
        <div className="container px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-12 opacity-50">
           <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-neon-blue" />
              <span className="text-xl font-black italic uppercase tracking-tighter">SolarAI</span>
           </div>
           <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
              <a href="#" className="hover:text-neon-blue transition-colors">Neural Assets</a>
              <a href="#" className="hover:text-neon-blue transition-colors">Privacy Buffer</a>
              <a href="#" className="hover:text-neon-blue transition-colors">Contact Terminal</a>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest">&copy; 2026 Architected by Antigravity</p>
        </div>
      </footer>
    </div>
  )
}

function ScanLine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M3 17v2a2 2 0 0 1 2 2h2" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  )
}
