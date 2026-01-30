
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Map as MapIcon,
  ChevronRight,
  Zap,
  Clock,
  Search,
  Activity,
  History,
  AlertCircle,
  BarChart3,
  MoreVertical
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
import { RiskLevel, Stats } from './types';
import { generateAIAnalysis } from './services/geminiService';

const ZONES = [
  { id: 'Z-01', name: 'Plaza West', location: 'Terminal 1', camId: 'CAM_A1' },
  { id: 'Z-02', name: 'Grand Atrium', location: 'Retail Wing', camId: 'CAM_B4' },
  { id: 'Z-03', name: 'North Pier', location: 'Departure Gate', camId: 'CAM_C2' },
];

const App: React.FC = () => {
  const [activeZone, setActiveZone] = useState(ZONES[0]);
  const [stats, setStats] = useState<Stats>({
    people_count: 0,
    risk_level: RiskLevel.LOW,
    timestamp: new Date().toLocaleTimeString()
  });
  const [history, setHistory] = useState<Stats[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for stats
  const fetchStats = useCallback(async () => {
    // Simulated backend call
    const mockCount = Math.floor(Math.random() * 150) + 30;
    let mockRisk = RiskLevel.LOW;
    if (mockCount > 130) mockRisk = RiskLevel.HIGH;
    else if (mockCount > 85) mockRisk = RiskLevel.MEDIUM;

    const newData: Stats = {
      people_count: mockCount,
      risk_level: mockRisk,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setStats(newData);
    setHistory(prev => [...prev.slice(-19), newData]);
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const report = await generateAIAnalysis(stats);
    setAiReport(report);
    setIsGenerating(false);
  };

  const statusTheme = useMemo(() => {
    switch (stats.risk_level) {
      case RiskLevel.LOW: 
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' };
      case RiskLevel.MEDIUM: 
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' };
      case RiskLevel.HIGH: 
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' };
      default: 
        return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-500' };
    }
  }, [stats.risk_level]);

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden">
      
      {/* Sidebar Navigation - Modern SaaS Style */}
      <aside className="w-64 border-r border-white/5 bg-[#0f172a] hidden md:flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CrowdSense</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Core Monitoring</p>
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
          <NavItem icon={<Camera size={18} />} label="Video Feeds" />
          <NavItem icon={<History size={18} />} label="Incident Logs" />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
          
          <div className="pt-8">
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Zones</p>
            {ZONES.map(zone => (
              <button 
                key={zone.id}
                onClick={() => setActiveZone(zone)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${activeZone.id === zone.id ? 'bg-white/5 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span>{zone.name}</span>
                <span className="text-[10px] mono opacity-50">{zone.id}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-bold">JD</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">John Doe</p>
              <p className="text-[10px] text-slate-500 truncate">System Admin</p>
            </div>
            <Settings size={14} className="text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/5 bg-[#020617]/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-400">{activeZone.location}</h2>
            <ChevronRight size={14} className="text-slate-600" />
            <h2 className="text-sm font-bold text-white">{activeZone.name}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                <span className="uppercase tracking-widest text-[9px]">Status: Active</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                <span className="mono">{currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#020617]">
          
          {/* Real-time Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <MetricTile 
              label="Live Occupancy" 
              value={stats.people_count.toString()} 
              unit="persons"
              icon={<Users size={20} />}
              trend="+4% from last hour"
              color="text-white"
            />
            <div className={`saas-card rounded-2xl p-6 border flex flex-col justify-between transition-all duration-500 ${statusTheme.border} ${stats.risk_level === RiskLevel.HIGH ? 'risk-high-active' : ''}`}>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Level</span>
                 <AlertCircle size={18} className={statusTheme.color} />
               </div>
               <div className="flex items-baseline gap-2">
                 <span className={`text-3xl font-bold uppercase ${statusTheme.color}`}>{stats.risk_level}</span>
                 <span className="text-xs text-slate-500 font-medium">Assessment</span>
               </div>
               <div className="mt-4 flex items-center gap-2">
                 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${statusTheme.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: stats.risk_level === RiskLevel.LOW ? '33%' : stats.risk_level === RiskLevel.MEDIUM ? '66%' : '100%' }} />
                 </div>
               </div>
            </div>
            <MetricTile 
              label="Flow Rate" 
              value="24.2" 
              unit="ppm"
              icon={<Activity size={20} />}
              trend="Optimized"
              color="text-blue-400"
            />
            <MetricTile 
              label="Avg. Dwell Time" 
              value="14" 
              unit="min"
              icon={<Clock size={20} />}
              trend="-2m since 09:00"
              color="text-white"
            />
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Monitor Column */}
            <div className="col-span-12 xl:col-span-8 space-y-8">
              
              {/* Primary Visual Feed */}
              <div className="rounded-3xl overflow-hidden saas-card flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                      <Camera size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Monitor: {activeZone.camId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-[10px] font-bold px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">RECONNECT</button>
                    <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500"><Maximize2 size={16}/></button>
                  </div>
                </div>

                <div className="aspect-video relative bg-slate-900 flex items-center justify-center">
                  <img 
                    src={`https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1600`}
                    alt="Crowd Feed"
                    className="w-full h-full object-cover opacity-80"
                  />
                  {/* High Quality UI overlays (Not Scifi, but professional) */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                     <div className="flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-500" />
                           <span className="text-[10px] font-bold text-white mono">OBJ_DETECTION: ON (48)</span>
                        </div>
                     </div>
                     <div className="flex items-end justify-center">
                        <div className="w-1/3 h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="w-2/3 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* AI Insight Section - Simplified & User Friendly */}
              <div className="saas-card rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 text-white">
                   <BrainCircuit size={24} />
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">Smart Analysis Report</h3>
                        <p className="text-xs text-slate-500 font-medium">Generated by Gemini AI • Real-time Safety Assessment</p>
                      </div>
                      <button 
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 text-white"
                      >
                        {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="fill-current" />}
                        {isGenerating ? 'Analyzing...' : 'Refresh AI Insight'}
                      </button>
                    </div>
                    
                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 min-h-[100px] relative overflow-hidden">
                      {isGenerating && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                           <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {aiReport ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiReport.split('\n')[0]}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                             {aiReport.split('\n').slice(1).map((line, idx) => {
                               const cleanLine = line.replace(/[*•-]/g, '').trim();
                               if (!cleanLine) return null;
                               return (
                                 <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                   <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                   <p className="text-[11px] text-slate-400 font-semibold">{cleanLine}</p>
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                           <p className="text-sm font-medium">Ready for system analysis</p>
                           <p className="text-[10px]">Click the button above to evaluate the current crowd dynamics using advanced AI.</p>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Sidebar Data Column */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              
              {/* Trend Chart Card */}
              <div className="saas-card rounded-3xl p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Growth Trend</h4>
                      <p className="text-[10px] font-medium text-slate-600">LAST 40 MINUTES</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                      <BarChart3 size={16} />
                    </div>
                 </div>
                 
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis hide domain={[0, 180]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="people_count" 
                          stroke="#3b82f6" 
                          strokeWidth={2.5}
                          fill="url(#chartFill)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex justify-between text-[10px] font-bold text-slate-500">
                    <span>08:42:00</span>
                    <span>CURRENT: {stats.people_count}P</span>
                 </div>
              </div>

              {/* Alerts & Logs Card */}
              <div className="saas-card rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h4>
                  <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase">View All</button>
                </div>
                
                <div className="space-y-4">
                   <ActivityRow 
                    type="warning" 
                    title="Density Spike Detected" 
                    subtitle="Zone Z-01 exceeded caution threshold (120+)" 
                    time="2m ago" 
                   />
                   <ActivityRow 
                    type="info" 
                    title="Camera Calibration" 
                    subtitle="Auto-alignment complete for CAM_B4" 
                    time="14m ago" 
                   />
                   <ActivityRow 
                    type="success" 
                    title="Report Exported" 
                    subtitle="Daily summary sent to security-head@city.gov" 
                    time="1h ago" 
                   />
                </div>

                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Zap size={14} className="fill-current" />
                    </div>
                    <span className="text-xs font-bold text-blue-400">Automated Protocols Ready</span>
                  </div>
                  <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Global Toast for High Risk */}
      {stats.risk_level === RiskLevel.HIGH && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-rose-600 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Critical Congestion</p>
                <p className="text-xs opacity-90 font-medium">Zone {activeZone.id} threshold exceeded. Protocol 4 active.</p>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg ml-4"><Maximize2 size={16} /></button>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper Components for clean architecture
const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const MetricTile = ({ label, value, unit, icon, trend, color }: any) => (
  <div className="saas-card rounded-2xl p-6 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</span>
      <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-slate-300 transition-colors">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-3xl font-bold tracking-tight ${color}`}>{value}</span>
      <span className="text-xs font-semibold text-slate-500">{unit}</span>
    </div>
    <p className="mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{trend}</p>
  </div>
);

const ActivityRow = ({ type, title, subtitle, time }: any) => {
  const iconMap: any = {
    warning: <AlertCircle size={14} className="text-rose-500" />,
    info: <Settings size={14} className="text-blue-500" />,
    success: <Zap size={14} className="text-emerald-500 fill-current" />
  };
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div className="pt-1">{iconMap[type]}</div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <p className="text-xs font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{title}</p>
          <span className="text-[10px] font-medium text-slate-600">{time}</span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
};

export default App;
