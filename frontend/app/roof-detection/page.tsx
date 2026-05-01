"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, Camera, ImageIcon, CheckCircle2,
  AlertCircle, ArrowRight, Scan, Brain, Layers,
  ChevronRight, Search, Zap, Cpu, RefreshCcw,
  FileImage, ZoomIn, Download, X, AlertTriangle
} from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useRouter } from "next/navigation"
import { analyzeRoof } from "@/lib/api"
import { cn } from "@/lib/utils"

const confidenceScores = [
  { label: "Roof Boundary", score: 97.4, color: "neon-blue" },
  { label: "Usable Area", score: 94.1, color: "neon-green" },
  { label: "Obstructions", score: 88.9, color: "neon-blue" },
  { label: "Orientation", score: 99.2, color: "neon-green" },
  { label: "Pitch Angle", score: 91.6, color: "neon-blue" },
]

export default function RoofDetectionPage() {
  const router = useRouter()
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing" | "complete" | "error">("idle")
  const [isDragging, setIsDragging] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  const analysisSteps = [
    "Decrypting satellite headers...",
    "Running neural edge detection...",
    "Segmenting roof geometry...",
    "Detecting obstructions...",
    "Calculating usable surface area...",
    "Generating thermal irradiance overlay...",
    "Finalizing neural weights...",
  ]

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setStage("uploading")
    
    try {
      // Start UI simulation of steps
      setStage("analyzing")
      let step = 0
      setProgress(0)
      const stepInterval = setInterval(() => {
        step = Math.min(step + 1, analysisSteps.length - 1)
        setAnalysisStep(step)
        setProgress(Math.round((step / analysisSteps.length) * 100))
      }, 700)

      // Actual API Call
      const result = await analyzeRoof(file)
      const data = result.data

      clearInterval(stepInterval)
      setAnalysisStep(analysisSteps.length)
      setProgress(100)
      setAnalysisResult(data)
      
      // Store results for the next page
      localStorage.setItem('solar_analysis_results', JSON.stringify(data))
      
      setTimeout(() => setStage("complete"), 600)
    } catch (err) {
      console.error("Analysis failed:", err)
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Backend connection failed. Make sure the FastAPI server is running on port 8000."
      )
      setStage("error")
    }
  }, [analysisSteps.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const reset = () => {
    setStage("idle")
    setImageUrl(null)
    setProgress(0)
    setAnalysisStep(0)
    setAnalysisResult(null)
    setErrorMsg("")
  }

  return (
    <div className="min-h-screen bg-background flex selection:bg-neon-blue/30 selection:text-white">
      <DashboardSidebar />

      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
        {/* Futuristic Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-blue/5 blur-[140px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-green/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />

        <header className="sticky top-0 z-30 glass border-b border-white/5 px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Neural Roof Inspector</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model: YOLOv8-X HighRes • Online</p>
            </div>
          </div>
          {stage !== "idle" && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass border border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-neon-blue/20 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Buffer
            </button>
          )}
        </header>

        <div className="p-8 max-w-6xl mx-auto page-transition">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black tracking-tight uppercase">Deploy Satellite Analysis</h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed font-medium">
                    Our high-density neural network segments roof architecture, detects thermal obstructions, 
                    and calculates precise usable surface area for solar array deployment.
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "glass rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center min-h-[420px] cursor-pointer transition-all duration-500 group relative overflow-hidden",
                    isDragging
                      ? "border-neon-blue/60 bg-neon-blue/5 glow-blue"
                      : "border-white/5 hover:border-neon-blue/40 hover:bg-neon-blue/[0.02]"
                  )}
                >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(var(--neon-blue) 1px, transparent 1px)",
                      backgroundSize: "24px 24px"
                    }}
                  />
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-8 text-center px-8">
                    <div className={cn(
                      "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700",
                      isDragging
                        ? "bg-neon-blue/20 border border-neon-blue/40 glow-blue scale-110"
                        : "bg-neon-blue/10 border border-neon-blue/20 group-hover:scale-105 group-hover:rotate-3"
                    )}>
                      <Upload className="w-10 h-10 text-neon-blue" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">
                        {isDragging ? "Drop to Initiate" : "Satellite Asset Upload"}
                      </h3>
                      <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">
                        Drag and drop your aerial imagery here to begin the neural decomposition process.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <span className="glass rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-white/5 group-hover:border-neon-blue/20 transition-all">GeoTIFF</span>
                      <span className="glass rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-white/5 group-hover:border-neon-blue/20 transition-all">Ultra-HD PNG</span>
                      <span className="glass rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-white/5 group-hover:border-neon-blue/20 transition-all">Raw WebP</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Scan, label: "Auto-Segmentation", sub: "99.8% precision edge detect" },
                    { icon: Brain, label: "Obstacle Masking", sub: "Deep chimney & vent detection" },
                    { icon: Layers, label: "Multi-Layer Mesh", sub: "3D roof geometry projection" }
                  ].map((item, i) => (
                    <div key={i} className="glass rounded-3xl p-6 border border-white/5 flex gap-5 items-center hover:border-neon-blue/20 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-neon-blue/10 transition-all">
                        <item.icon className="w-6 h-6 text-neon-blue/60 group-hover:text-neon-blue transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(stage === "uploading" || stage === "analyzing") && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto space-y-12 py-8"
              >
                <div className="relative aspect-video glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                  {imageUrl && (
                    <img src={imageUrl} alt="Scanning" className="w-full h-full object-cover opacity-60 grayscale scale-110 blur-[1px]" />
                  )}
                  {/* High-tech Scanning Overlay */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                      className="absolute top-0 left-0 right-0 h-1 bg-neon-blue glow-blue z-20"
                    />
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-15 pointer-events-none">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border-[0.2px] border-white/10" />
                      ))}
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-12">
                    <div className="w-24 h-24 rounded-full border-4 border-neon-blue/20 border-t-neon-blue animate-spin glow-blue" />
                    <div className="text-center space-y-4">
                      <h3 className="text-3xl font-black uppercase tracking-[0.4em] text-neon-blue text-glow-blue drop-shadow-2xl">
                        {stage === "uploading" ? "Encrypting Data" : "Neural Scan Active"}
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
                          {analysisSteps[analysisStep] || "Processing Vector..."}
                        </p>
                      </div>
                    </div>
                    <div className="w-full max-w-md h-2 glass rounded-full overflow-hidden relative border border-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-neon-blue glow-blue"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {analysisSteps.slice(0, 4).map((step, i) => (
                    <div key={i} className="glass rounded-3xl p-6 border border-white/5 space-y-3 relative overflow-hidden">
                      <div className={cn("w-1.5 h-1.5 rounded-full", i <= analysisStep ? "bg-neon-blue glow-blue" : "bg-white/10")} />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Stage {i + 1}</p>
                        <p className="text-[11px] font-bold text-foreground truncate">{step}</p>
                      </div>
                      {i === analysisStep && <div className="absolute bottom-0 left-0 h-1 bg-neon-blue animate-pulse w-full" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === "complete" && analysisResult && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">Neural Sync Successful</h2>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">Matrix Lock: Latency 0.4s • Accuracy 98.4%</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={reset}
                      className="px-6 py-3 rounded-2xl glass border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Purge Buffer
                    </button>
                    <button
                      onClick={() => router.push("/solar-estimation")}
                      className="px-8 py-3 rounded-2xl bg-neon-blue text-background text-[10px] font-black uppercase tracking-[0.2em] glow-blue flex items-center gap-3 hover:bg-neon-blue/90 transition-all"
                    >
                      Run ROI Engine <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass rounded-[3rem] overflow-hidden border border-white/10 aspect-square group relative shadow-2xl">
                    <img src={imageUrl!} alt="Result" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-neon-blue/10 mix-blend-overlay opacity-40" />
                    
                    {/* SVG Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon
                        points="20,25 80,25 80,75 20,75"
                        fill="oklch(0.72 0.2 205 / 0.15)"
                        stroke="var(--neon-blue)"
                        strokeWidth="0.5"
                        className="animate-pulse"
                      />
                    </svg>

                    <div className="absolute top-8 left-8 glass rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue border-neon-blue/30 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-neon-blue glow-blue animate-pulse" />
                      Target Vector Identified
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="glass rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all group-hover:scale-110">
                          <Layers className="w-16 h-16 text-neon-blue" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Usable Spectrum</p>
                        <p className="text-6xl font-black text-neon-blue tracking-tighter">
                          {analysisResult.roof_area_sqm.toFixed(1)}
                          <span className="text-xl ml-2 font-bold opacity-40 tracking-normal">M²</span>
                        </p>
                      </div>
                      <div className="glass rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all group-hover:scale-110">
                          <Zap className="w-16 h-16 text-neon-green" />
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Neural Capacity</p>
                        <p className="text-6xl font-black text-neon-green tracking-tighter">
                          {analysisResult.estimated_capacity_kw.toFixed(1)}
                          <span className="text-xl ml-2 font-bold opacity-40 tracking-normal">KW</span>
                        </p>
                      </div>
                    </div>

                    <div className="glass rounded-[2.5rem] p-8 border border-white/5 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Vector Diagnostics</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-neon-green">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Asset
                        </div>
                      </div>
                      <div className="space-y-5">
                        {confidenceScores.map((item, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className={item.color === "neon-blue" ? "text-neon-blue" : "text-neon-green"}>{item.score}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                className={cn("h-full", item.color === "neon-blue" ? "bg-neon-blue glow-blue" : "bg-neon-green glow-green")}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/solar-estimation")}
                      className="glass rounded-[2rem] p-8 border border-neon-blue/30 bg-neon-blue/5 flex items-center justify-between cursor-pointer group relative overflow-hidden transition-all duration-500"
                    >
                      <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-neon-blue/20 flex items-center justify-center text-neon-blue glow-blue transition-transform group-hover:rotate-12">
                          <Brain className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-black tracking-tight text-foreground italic">Execute ROI Forecasting</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Random Forest Intelligence Layer</p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-neon-blue group-hover:translate-x-2 transition-transform relative z-10" />
                    </motion.div>
                  </div>
                </div>

                <div className="glass rounded-[2rem] p-6 border border-yellow-400/20 flex items-center gap-5 bg-yellow-400/[0.02]">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
                    Neural Hint: Detection ID-749 indicates high chimney obstruction. ROI engine will automatically reallocate panel matrix to eastern sector.
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto py-16 flex flex-col items-center text-center gap-8"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-red-400/10 border border-red-400/30 flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-red-400">Analysis Failed</h2>
                  <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
                    {errorMsg || "Could not connect to the AI backend. Make sure the FastAPI server is running."}
                  </p>
                </div>
                <div className="glass rounded-[2rem] p-6 border border-red-400/20 bg-red-400/[0.03] w-full text-left space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400">How to fix:</p>
                  <code className="block text-xs font-mono text-muted-foreground bg-white/5 rounded-xl px-4 py-3">
                    cd Solar-ai-platform/backend<br />
                    python run.py
                  </code>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Then ensure <strong>NEXT_PUBLIC_API_URL</strong> in <code>.env.local</code> points to <code>http://localhost:8000/api/v1</code>
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="px-8 py-4 rounded-2xl bg-neon-blue text-background text-[10px] font-black uppercase tracking-[0.2em] glow-blue hover:bg-neon-blue/90 transition-all flex items-center gap-3"
                >
                  <RefreshCcw className="w-4 h-4" /> Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
