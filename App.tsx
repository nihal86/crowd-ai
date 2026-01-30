
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, 
  ShieldAlert, 
  RefreshCw, 
  Camera, 
  LayoutDashboard,
  Bell,
  Settings,
  BrainCircuit,
  Maximize2,
  ChevronRight,
  Zap,
  Clock,
  Search,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MoreHorizontal,
  Info,
  ChevronDown,
  Plane,
  ShieldCheck,
  Server,
  FileText,
  Globe,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Menu,
  X,
  Play,
  Monitor
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { RiskLevel, Stats } from './types';
import { generateAIAnalysis } from './services/geminiService';

const VIDEO_FEED_URL = "/video_feed";
const HERO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-busy-airport-terminal-with-passengers-walking-43407-large.mp4";
const OPS_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-airport-and-runways-23577-large.mp4";
// High-resolution image of a modern airport hub to fulfill the user request
const HUB_IMAGE = "https://images.unsplash.com/photo-1529139513055-0a631346be94?q=80&w=2070&auto=format&fit=crop";

const App: React.FC = () => {
  const [stats, setStats] = useState<Stats & { current_source?: string }>({
    people_count: 0,
    risk_level: RiskLevel.LOW,
    timestamp: new Date().toLocaleTimeString(),
    current_source: "0"
  });
  const [history, setHistory] = useState<Stats[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [customSource, setCustomSource] = useState('');
  const [feedKey, setFeedKey] = useState(0); 

  const { scrollY } = useScroll();
  const heroVideoY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/stats');
      if (!response.ok) throw new Error('Backend unreachable');
      const data = await response.json();
      const newData: Stats & { current_source?: string } = {
        people_count: data.people_count,
        risk_level: data.risk_level as RiskLevel,
        current_source: data.current_source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStats(newData);
      setHistory(prev => [...prev.slice(-29), newData]);
    } catch (error) {
      console.error("Telemetry error:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleSetSource = async (source: string) => {
    try {
      const response = await fetch('/set_source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
      });
      if (response.ok) {
        setShowSourceMenu(false);
        setFeedKey(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Error setting source:", error);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const report = await generateAIAnalysis(stats);
    setAiReport(report);
    setIsGenerating(false);
  };

  const riskStatus = useMemo(() => {
    switch (stats.risk_level) {
      case RiskLevel.LOW: 
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'OPTIMAL' };
      case RiskLevel.MEDIUM: 
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'CAUTION' };
      case RiskLevel.HIGH: 
        return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'CRITICAL' };
      default: 
        return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'UNKNOWN' };
    }
  }, [stats.risk_level]);

  return (
    <div className="relative">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#00a3e0] z-[110] origin-left" style={{ scaleX }} />

      {/* 1. Header Navigation */}
      <header className={`fixed top-0 w-full z-[100] flex items-center justify-between px-8 lg:px-20 glass-nav ${scrolled ? 'scrolled' : 'h-24 text-white'}`}>
        <div className="flex items-center gap-14">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { window.scrollTo(0, 0); }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${scrolled ? 'bg-[#001a33] text-white' : 'bg-white text-[#001a33]'}`}>
              <Users size={24} className="transform -rotate-12" />
            </div>
            <span className={`text-2xl font-extrabold tracking-tighter transition-colors ${scrolled ? 'text-[#001a33]' : 'text-white'}`}>
              CrowdSense<span className="text-[#00a3e0]">AI</span>
            </span>
          </motion.div>
          <nav className="hidden xl:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest">
            <NavItem label="Solutions" scrolled={scrolled} />
            <NavItem label="Products" scrolled={scrolled} />
            <NavItem label="About Us" scrolled={scrolled} />
            <NavItem label="Resources" scrolled={scrolled} />
            <NavItem label="India Presence" scrolled={scrolled} />
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className={`text-[13px] font-bold uppercase tracking-widest ${scrolled ? 'text-[#001a33]' : 'text-white/80'}`}>Partner Portal</button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3.5 rounded-full text-[13px] font-extrabold uppercase tracking-[0.15em] transition-all shadow-2xl ${scrolled ? 'bg-[#001a33] text-white shadow-[#001a33]/20' : 'bg-[#00a3e0] text-white shadow-[#00a3e0]/30'}`}
          >
            Request Demo
          </motion.button>
        </div>
      </header>

      {/* Main Content Sections */}
      <main>
        {/* HERO SECTION WITH PARALLAX BACKGROUND VIDEO */}
        <section className="hero-video-container relative">
          <motion.div style={{ y: heroVideoY }} className="absolute inset-0 w-full h-full">
            <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#001a33]/40 z-10" />
          
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20"
          >
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="max-w-6xl"
            >
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 mb-12">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00a3e0] animate-pulse" />
                <span className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Leading India's Crowd Intelligence</span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[1] tracking-tighter mb-10">
                TRUE AI CROWD<br />
                <span className="text-[#00a3e0]">SENSING.</span>
              </h1>
              <p className="text-xl md:text-3xl text-slate-200 font-medium mb-16 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                Delivering real-time safety and operational intelligence to India's busiest urban hubs and transportation networks.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-8 mb-20">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#00a3e0] text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,163,224,0.3)]"
                  onClick={() => document.getElementById('solutions')?.scrollIntoView()}
                >
                  Explore Platform
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-[#001a33] px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl"
                >
                  Watch Showreel
                </motion.button>
              </div>

              <div className="flex flex-wrap justify-center gap-14 text-[13px] font-black uppercase tracking-[0.4em] text-white/50">
                <HeroMetric icon={<LayoutDashboard size={20}/>} label="Unified Monitor" />
                <HeroMetric icon={<Activity size={20}/>} label="Smart Analytics" />
                <HeroMetric icon={<Globe size={20}/>} label="India Scale" />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 15, 0], opacity: [0.3, 1, 0.3] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30"
          >
            <ChevronDown className="text-white" size={48} />
          </motion.div>
        </section>

        {/* FEATURED HUB IMAGE SECTION (Requested Visual Addition) */}
        <section className="py-24 px-8 lg:px-20 bg-white border-b border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2 space-y-10"
              >
                <span className="text-[#00a3e0] text-[12px] font-black uppercase tracking-[0.6em] block">Indian Operations Hub</span>
                <h2 className="text-5xl font-black text-[#001a33] tracking-tighter leading-tight">THE VISTA OF MODERN URBAN MOBILITY</h2>
                <p className="text-slate-500 text-xl leading-relaxed font-medium">
                  CrowdSense AI provides unmatched visibility across complex airport environments. From the tarmac to the security gate, we bridge the gap between visual data and actionable safety protocols.
                </p>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#00a3e0]" size={20} />
                    <span className="text-sm font-bold text-slate-700">Live Telemetry</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#00a3e0]" size={20} />
                    <span className="text-sm font-bold text-slate-700">Predictive Flow</span>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:w-1/2 relative"
              >
                <div className="rounded-[60px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] relative group">
                  <img src={HUB_IMAGE} className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110" alt="Indian Airport Hub" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/60 to-transparent" />
                  <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20">
                    <Plane className="text-white" size={24} />
                    <span className="text-white text-xs font-black uppercase tracking-widest">Aviation Node Alpha-7</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. PIONEERING STATS SECTION */}
        <section className="py-48 px-8 lg:px-20 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-32 items-start">
              <div className="lg:w-1/2">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-[#00a3e0] text-[12px] font-black uppercase tracking-[0.6em] mb-8 block">About CrowdSense AI</span>
                  <h2 className="text-6xl font-black text-[#001a33] mb-12 tracking-tighter leading-[1.1]">PIONEERING AI-DRIVEN CROWD INTELLIGENCE IN INDIA</h2>
                  <p className="text-slate-500 text-2xl leading-relaxed mb-16 font-medium">
                    Built for the unique scale of the Indian landscape. CrowdSense AI provides the deep learning infrastructure required to manage densities in the world's fastest-growing cities.
                  </p>
                  <div className="flex items-center gap-8">
                    <button className="bg-[#001a33] text-white px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#00a3e0] transition-all">Our Story</button>
                    <button className="group flex items-center gap-4 text-[#001a33] font-black uppercase tracking-[0.2em] text-xs">
                      View Case Studies <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-12 w-full">
                <BigStat value="50+" label="INDIAN CITIES" />
                <BigStat value="30+" label="INDIAN AIRPORTS" />
                <BigStat value="100+" label="ENTERPRISES" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. OPERATIONAL DASHBOARD (LIVE HUB) */}
        <section id="solutions" className="py-48 px-8 lg:px-20 bg-[#001a33] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full video-grid-line opacity-20 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-28 flex flex-col md:flex-row items-end justify-between gap-12">
              <div className="max-w-3xl">
                <span className="text-[#00a3e0] text-[12px] font-black uppercase tracking-[0.6em] mb-8 block">Control Center</span>
                <h2 className="text-6xl font-black tracking-tighter leading-none">REAL-TIME VISUAL INTELLIGENCE</h2>
              </div>
              <div className="flex gap-6 relative">
                 <button 
                  onClick={() => setShowSourceMenu(!showSourceMenu)}
                  className={`p-5 rounded-2xl border transition-all shadow-xl flex items-center gap-3 ${showSourceMenu ? 'bg-[#00a3e0] border-[#00a3e0] text-white' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                 >
                    <Monitor size={24}/>
                    <span className="text-xs font-black uppercase tracking-widest">Select Feed</span>
                 </button>
                 
                 <AnimatePresence>
                  {showSourceMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-80 bg-[#001a33] border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100] p-6 space-y-4"
                    >
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Operational Inputs</h5>
                      <SourceOption 
                        icon={<Camera size={16}/>} 
                        label="Live Video Unit 1" 
                        active={stats.current_source === "0"}
                        onClick={() => handleSetSource("0")} 
                      />
                      <SourceOption 
                        icon={<Play size={16}/>} 
                        label="Terminal Zone Alpha" 
                        active={stats.current_source === HERO_VIDEO}
                        onClick={() => handleSetSource(HERO_VIDEO)} 
                      />
                      <SourceOption 
                        icon={<Activity size={16}/>} 
                        label="Platform Monitoring" 
                        active={stats.current_source === OPS_VIDEO}
                        onClick={() => handleSetSource(OPS_VIDEO)} 
                      />
                      
                      <div className="pt-4 border-t border-white/5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 block">RTSP Uplink</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="rtsp://192.168.1.100..."
                            value={customSource}
                            onChange={(e) => setCustomSource(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-[#00a3e0] outline-none transition-colors"
                          />
                          <button 
                            onClick={() => handleSetSource(customSource)}
                            className="bg-[#00a3e0] p-2 rounded-xl"
                          >
                            <ArrowRight size={16}/>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                 </AnimatePresence>

                 <button className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-xl"><Bell size={24}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* LIVE OPERATIONS MONITOR */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-8 bg-black rounded-[50px] overflow-hidden border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.8)]"
              >
                <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.04]">
                  <div className="flex items-center gap-6">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.9)]" />
                    <span className="text-[13px] font-black uppercase tracking-[0.4em] text-white/90">CCC Live Stream | Node ID: 0092-IND</span>
                  </div>
                  <div className="flex items-center gap-8 text-[11px] mono text-slate-500 font-bold uppercase tracking-[0.2em]">
                    <span className="truncate max-w-[150px]">FEED: {stats.current_source === "0" ? "LOCAL_UNIT" : "NETWORK_SRV"}</span>
                    <button className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"><Maximize2 size={20}/></button>
                  </div>
                </div>
                <div className="aspect-video relative bg-[#010101]">
                  <img 
                    key={feedKey}
                    src={`${VIDEO_FEED_URL}?t=${Date.now()}`} 
                    className="w-full h-full object-contain relative z-10" 
                    alt="Live Operational Stream" 
                  />
                  <div className="absolute inset-0 video-grid-line opacity-15 z-0 pointer-events-none" />
                  
                  {/* VMS Overlay Info */}
                  <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end z-20">
                     <div className="bg-black/70 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 flex items-center gap-12 shadow-3xl">
                        <MonitorMetric label="Crowd Count" value={stats.people_count} color="text-[#00a3e0]" />
                        <div className="w-px h-12 bg-white/10" />
                        <MonitorMetric label="Safety Level" value={stats.risk_level} color={riskStatus.color} />
                     </div>
                     <motion.div 
                       whileHover={{ scale: 1.05 }}
                       className="bg-[#00a3e0] text-white p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,163,224,0.4)] flex items-center gap-6 cursor-pointer border border-white/10"
                      >
                        <Zap size={28} className="fill-current" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Safety Protocol</span>
                     </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* AI ANALYST WIDGET */}
              <div className="lg:col-span-4 flex flex-col h-full">
                <div className="bg-white/5 backdrop-blur-[100px] p-12 rounded-[50px] border border-white/10 flex flex-col flex-1 shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="w-16 h-16 bg-[#00a3e0] rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-[#00a3e0]/30">
                      <BrainCircuit size={36} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">Crowd Intelligence</h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Analytical Core v1.4</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-white/[0.04] rounded-[40px] p-10 border border-white/5 mb-12 overflow-y-auto custom-scrollbar shadow-inner">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full gap-8 opacity-40">
                        <RefreshCw className="animate-spin text-[#00a3e0]" size={40} />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-center">Synthesizing Crowd Dynamics...</span>
                      </div>
                    ) : aiReport ? (
                      <div className="space-y-10">
                        <div className="relative">
                          <p className="text-[17px] font-bold text-slate-200 leading-relaxed italic border-l-[6px] border-[#00a3e0] pl-8 py-2">{aiReport.split('\n')[0]}</p>
                          <div className="absolute -top-4 -right-4 opacity-10"><Info size={56}/></div>
                        </div>
                        <div className="space-y-6">
                          {aiReport.split('\n').slice(1).map((line, i) => line.trim() && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="flex gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-[#00a3e0]/30 transition-all group cursor-default"
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-[#00a3e0] mt-1.5 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_#00a3e0]" />
                              <p className="text-slate-400 font-medium leading-relaxed text-base">{line.replace(/[*•-]/g, '').trim()}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale">
                        <FileText size={80} className="mb-8 text-slate-500" />
                        <p className="text-sm font-black uppercase tracking-[0.5em]">System Ready for Analysis</p>
                      </div>
                    )}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full bg-[#00a3e0] text-white py-7 rounded-[30px] font-black text-[13px] uppercase tracking-[0.5em] hover:bg-white hover:text-[#001a33] transition-all shadow-[0_30px_60px_rgba(0,163,224,0.3)] disabled:opacity-50"
                  >
                    {isGenerating ? 'Synthesizing...' : 'Generate Safety Audit'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOLVING CHALLENGES */}
        <section className="py-48 px-8 lg:px-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-32">
               <span className="text-[#00a3e0] text-[12px] font-black uppercase tracking-[0.8em] mb-8 block">Safety Solutions</span>
               <h2 className="text-6xl font-black text-[#001a33] tracking-tight leading-none">SECURING INDIA'S HIGHEST<br/>DENSITY URBAN NODES</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               <SectorCard 
                  title="Metro & Transit" 
                  desc="Managing peak-hour passenger flow and identifying platform bottlenecks in real-time." 
                  img="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop"
                  icon={<Plane size={36}/>}
               />
               <SectorCard 
                  title="Public Safety" 
                  desc="Autonomous event monitoring and crowd anomaly detection for large-scale urban gatherings." 
                  img="https://images.unsplash.com/photo-1540339832862-4745299807c3?q=80&w=2070&auto=format&fit=crop"
                  icon={<ShieldCheck size={36}/>}
               />
               <SectorCard 
                  title="Smart Retail" 
                  desc="Understanding footfall patterns and queue management for India's premier shopping destinations." 
                  img="https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=2070&auto=format&fit=crop"
                  icon={<Server size={36}/>}
               />
            </div>
          </div>
        </section>

        {/* 5. CASE STUDIES */}
        <section className="py-48 px-8 lg:px-20 bg-[#f8fafc] border-y border-slate-200">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-32">
                 <div className="max-w-3xl">
                    <span className="text-[#00a3e0] text-[12px] font-black uppercase tracking-[0.8em] mb-8 block">Proven Success</span>
                    <h2 className="text-6xl font-black text-[#001a33] tracking-tighter leading-none">INTELLIGENCE IN ACTION ACROSS INDIA</h2>
                 </div>
                 <button className="bg-[#001a33] text-white px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#00a3e0] transition-colors shadow-2xl">View Case Studies</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                 <CaseItem country="Delhi NCR" title="Metro Peak Flow" desc="Managing record-breaking passenger processing at interchange hubs." />
                 <CaseItem country="Mumbai" title="Terminal Safety" desc="Unified security monitoring for India's premier transportation gateway." />
                 <CaseItem country="Bengaluru" title="Smart City Node" desc="Real-time density analytics for the Silicon Valley of India." />
                 <CaseItem country="Hyderabad" title="Urban Gatherings" desc="Ensuring safety at high-traffic public squares and commercial hubs." />
              </div>
           </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
           <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover brightness-[0.2] contrast-[1.1]">
             <source src={OPS_VIDEO} type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-t from-[#001a33] via-transparent to-[#001a33]/60 z-10" />
           <div className="relative z-20 text-center px-8">
              <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="max-w-6xl"
              >
                 <h2 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter uppercase leading-[0.9]">SECURE YOUR DENSITY<br/>INFRASTRUCTURE TODAY.</h2>
                 <p className="text-2xl md:text-4xl text-slate-300 font-medium mb-20 max-w-5xl mx-auto leading-relaxed drop-shadow-2xl">
                   Empower your urban center with the most advanced unified crowd management and deep learning platform.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-10">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="bg-[#00a3e0] text-white px-16 py-7 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-[0_30px_70px_rgba(0,163,224,0.4)]"
                    >
                      Book a Demo
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="bg-white text-[#001a33] px-16 py-7 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl"
                    >
                      Contact Sales
                    </motion.button>
                 </div>
              </motion.div>
           </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-[#000a14] pt-48 pb-20 px-8 lg:px-20 text-slate-500">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-32 mb-40">
               <div className="space-y-14">
                  <div className="flex items-center gap-4">
                    <Users className="text-[#00a3e0]" size={44} />
                    <span className="text-4xl font-extrabold text-white tracking-tighter">CrowdSense<span className="text-[#00a3e0]">AI</span></span>
                  </div>
                  <p className="text-base font-medium leading-relaxed max-sm">
                    The gold standard in AI-powered crowd surveillance. Built to secure India's busiest cities.
                  </p>
                  <div className="flex gap-6">
                     <SocialCircle icon={<Globe size={22}/>} />
                     <SocialCircle icon={<Activity size={22}/>} />
                     <SocialCircle icon={<Bell size={22}/>} />
                     <SocialCircle icon={<Search size={22}/>} />
                  </div>
               </div>
               
               <FooterSection title="Platform" items={["Unified VMS", "Crowd Analytics", "Traffic Analysis", "Cloud Storage", "API Access"]} />
               <FooterSection title="Sectors" items={["Public Transit", "Smart Cities", "Retail Hubs", "Event Spaces", "Aviation"]} />
               <FooterSection title="Company" items={["Our Story", "Team", "Case Studies", "Press Hub", "Support"]} />
            </div>

            <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-[12px] font-black uppercase tracking-[0.5em] text-slate-700">
               <p>© 2025 CrowdSense Intelligence Systems. Indian Operations HQ.</p>
               <div className="flex flex-wrap justify-center gap-12">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Security</a>
                  <a href="#" className="hover:text-white transition-colors">Cookies</a>
               </div>
            </div>
         </div>
      </footer>

      {/* HIGH RISK OVERLAY */}
      <AnimatePresence>
        {stats.risk_level === RiskLevel.HIGH && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-16 right-16 z-[200] w-[500px]"
          >
            <div className="alert-pulse bg-rose-600 text-white p-10 rounded-[50px] shadow-[0_50px_120px_rgba(225,29,72,0.5)] flex items-center gap-10 border border-rose-400/30 backdrop-blur-3xl">
              <div className="w-24 h-24 bg-white/20 rounded-[40px] flex items-center justify-center shrink-0 border border-white/30">
                <ShieldAlert size={56} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] mb-3 opacity-80">System Critical Alert</p>
                <p className="text-lg font-extrabold leading-tight tracking-tight">Maximum capacity reached in monitoring zone. Automated protocol dispatched. Deploy safety unit immediately.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ label, scrolled }: { label: string, scrolled: boolean }) => (
  <div className={`flex items-center gap-2 cursor-pointer hover:text-[#00a3e0] transition-colors group relative`}>
    {label}
    <ChevronDown size={14} className="opacity-40 group-hover:rotate-180 transition-transform duration-300" />
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00a3e0] transition-all group-hover:w-full"></span>
  </div>
);

const HeroMetric = ({ icon, label }: any) => (
  <div className="flex items-center gap-6 group">
    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/40 group-hover:text-[#00a3e0] group-hover:bg-white/20 transition-all shadow-xl">
      {icon}
    </div>
    <span className="group-hover:text-white transition-colors font-bold">{label}</span>
  </div>
);

const BigStat = ({ value, label }: any) => (
  <div className="p-14 rounded-[50px] bg-[#f8fafc] border border-slate-100 hover:shadow-3xl hover:border-white transition-all duration-700 cursor-default group">
    <div className="text-6xl font-black text-[#001a33] tracking-tighter mb-6 group-hover:text-[#00a3e0] transition-colors">{value}</div>
    <div className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em]">{label}</div>
  </div>
);

const MonitorMetric = ({ label, value, color }: any) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{label}</span>
    <span className={`text-4xl font-black mono tracking-tighter ${color}`}>{value}</span>
  </div>
);

const SectorCard = ({ title, desc, img, icon }: any) => (
  <motion.div 
    whileHover={{ y: -30 }}
    className="group rounded-[60px] overflow-hidden bg-white shadow-soft perspective-card cursor-pointer border border-slate-100"
  >
    <div className="aspect-[4/6] relative overflow-hidden">
      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-[0.7] contrast-[1.1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001a33] via-transparent to-transparent z-10 opacity-80" />
      <div className="absolute bottom-12 left-12 right-12 z-20">
        <div className="w-20 h-20 bg-[#00a3e0] rounded-3xl flex items-center justify-center text-white mb-10 shadow-2xl group-hover:scale-110 transition-transform">
           {icon}
        </div>
        <h3 className="text-4xl font-black text-white mb-8 uppercase tracking-tighter leading-none">{title}</h3>
        <p className="text-slate-300 text-lg font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700">
          {desc}
        </p>
      </div>
    </div>
  </motion.div>
);

const CaseItem = ({ country, title, desc }: any) => (
  <motion.div 
    whileHover={{ y: -20 }}
    className="bg-white p-14 rounded-[60px] shadow-3xl border border-slate-100 h-full flex flex-col justify-between hover:border-[#00a3e0]/40 transition-all duration-500 cursor-pointer group"
  >
    <div>
      <div className="text-[11px] font-black text-[#00a3e0] uppercase tracking-[0.6em] mb-10">{country}</div>
      <h3 className="text-3xl font-black text-[#001a33] mb-10 uppercase tracking-tighter leading-tight group-hover:text-[#00a3e0] transition-colors">{title}</h3>
      <p className="text-slate-500 text-lg font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="mt-14 w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-[#001a33] group-hover:bg-[#001a33] group-hover:text-white transition-all shadow-sm">
      <ChevronRight size={24} />
    </div>
  </motion.div>
);

const SocialCircle = ({ icon }: any) => (
  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#00a3e0] hover:text-white hover:border-[#00a3e0] transition-all cursor-pointer shadow-lg">
    {icon}
  </div>
);

const FooterSection = ({ title, items }: any) => (
  <div className="space-y-16">
    <h4 className="text-white text-[12px] font-black uppercase tracking-[0.8em]">{title}</h4>
    <ul className="space-y-8">
      {items.map((item: string, i: number) => (
        <li key={i}>
          <a href="#" className="hover:text-white transition-colors font-bold text-base tracking-tight text-slate-600 block">
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const SourceOption = ({ icon, label, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${active ? 'bg-[#00a3e0]/10 border-[#00a3e0] text-[#00a3e0]' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
  >
    <div className={active ? 'text-[#00a3e0]' : 'text-slate-500'}>{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {active && <div className="w-2 h-2 rounded-full bg-[#00a3e0] shadow-[0_0_10px_#00a3e0]"/>}
  </button>
);

export default App;
