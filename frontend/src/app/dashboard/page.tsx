'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  Plus, 
  Folder, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  TrendingUp, 
  Activity,
  Milestone,
  Play,
  Terminal,
  CheckCircle2,
  Calendar,
  ShieldAlert
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  riskScore: number;
  thumbnail?: string;
  createdAt: string;
  health?: {
    score: number;
    status: 'Healthy' | 'At Risk' | 'Critical';
    statusColor: 'green' | 'yellow' | 'red';
    timelineRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    requirementCompleteness: number;
    sprintVelocity: 'Stable' | 'Declining' | 'Improving' | 'No Sprints';
    blockedTasks: number;
    technicalDebt: 'Low' | 'Medium' | 'High';
    confidence: number;
  };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    avgRiskScore: 0,
    overallTasksCount: 24,
    completedTasksCount: 16
  });
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[System] Ready for multi-agent diagnostic run. Click 'Run Simulation' to test."
  ]);
  const [simulating, setSimulating] = useState(false);

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setConsoleLogs([]);
    
    const logs = [
      "[System] Initiating LangGraph Multi-Agent execution context...",
      "[Planner Agent] Reading product requirement document (PRD)...",
      "[Planner Agent] GOALS: Extracted 3 core business deliverables.",
      "[Planner Agent] MILESTONES: Generated Phase 1 (MVP Setup) and Phase 2 (Auth integration).",
      "[Issue Generator] Breaking down Phase 1 milestones into technical user stories...",
      "[Issue Generator] TASKS: Created 8 sprint tasks with estimated hours and story points.",
      "[Risk Analyzer] Performing automated risk assessment on draft architecture...",
      "[Risk Analyzer] WARNING: Potential API gateway rate limiting risk detected.",
      "[Risk Analyzer] SUGGESTION: Configure retry middleware with exponential backoff.",
      "[Scrum Master] Aggregating results and validating JSON schemas...",
      "[System] Multi-agent graph run completed. Planning board populated."
    ];
    
    logs.forEach((log, index) => {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setSimulating(false);
        }
      }, (index + 1) * 800);
    });
  };

  // Mock historical sprint velocity data for Recharts
  const chartData = [
    { name: 'Sprint 1', completed: 15, goal: 20 },
    { name: 'Sprint 2', completed: 22, goal: 22 },
    { name: 'Sprint 3', completed: 18, goal: 25 },
    { name: 'Sprint 4', completed: 26, goal: 25 },
    { name: 'Sprint 5', completed: 32, goal: 30 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/projects');
        const projList = res.data.projects || [];
        setProjects(projList);
        
        // Calculate metrics
        const total = projList.length;
        const active = projList.filter((p: Project) => p.status === 'active' || p.status === 'planning').length;
        const totalRisk = projList.reduce((sum: number, p: Project) => sum + (p.riskScore || 0), 0);
        const avgRisk = total > 0 ? Math.round(totalRisk / total) : 0;

        setMetrics(prev => ({
          ...prev,
          totalProjects: total,
          activeProjects: active,
          avgRiskScore: avgRisk
        }));
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dynamic Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 18) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  // State for interactive recommendation checks
  const [recsActionState, setRecsActionState] = useState<{ [key: string]: boolean }>({});

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* ⭐ AI ENGINEERING MANAGER PROACTIVE HERO DASHBOARD */}
        <div className="p-6 md:p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-zinc-900/90 to-zinc-950 shadow-2xl glass-panel space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-[100px] bg-indigo-500/20 pointer-events-none" />

          {/* Top Bar: Proactive Greeting & Health Score */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-indigo-500/15 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  🤖 AI Engineering Manager Co-Pilot
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400 font-mono">Live Monitoring</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{getGreeting()}</h1>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed font-sans">
                Here is your proactive engineering overview. Tasks, risks, and velocity trajectories calculated automatically.
              </p>
            </div>

            {/* Health Score Circular Gauge */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="stroke-zinc-800" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-emerald-500 transition-all duration-1000"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={(2 * Math.PI * 26).toString()}
                    strokeDashoffset={(2 * Math.PI * 26 * (1 - 0.89)).toString()}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-base font-extrabold text-white font-mono">89%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Overall Project Health</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">✓ Optimal Velocity</span>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">High delivery confidence rate</p>
              </div>
            </div>
          </div>

          {/* 4-Grid Proactive Action Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Today's Priorities */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  Today's Priorities
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold">Top 3</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <span className="text-zinc-200 font-semibold truncate">Finish Authentication</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <span className="text-zinc-200 font-semibold truncate">Review PR #24</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-indigo-600/30 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <span className="text-zinc-200 font-semibold truncate">Resolve Payment Bug</span>
                </div>
              </div>
            </div>

            {/* 2. AI Recommendations */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  AI Recommendations
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">Proactive</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'rec_1', text: 'Merge PR #12 (Passed QA)' },
                  { id: 'rec_2', text: 'Delay Sprint 5 (+2 days buffer)' },
                  { id: 'rec_3', text: 'Split Authentication Task (2 SP)' }
                ].map(rec => {
                  const done = recsActionState[rec.id];
                  return (
                    <button
                      key={rec.id}
                      onClick={() => setRecsActionState(prev => ({ ...prev, [rec.id]: !prev[rec.id] }))}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                        done
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="truncate">{rec.text}</span>
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${done ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Upcoming Risks */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Upcoming Risks
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">2 Flagged</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">Database Migration</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Schema breaking changes planned for Sprint 4.</p>
                </div>
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">Stripe Integration</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Webhook secret missing from environment keys.</p>
                </div>
              </div>
            </div>

            {/* 4. Recent AI Decisions */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-sky-400" />
                  Recent AI Decisions
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">Stream</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-sky-400 font-mono block">Auth Prioritized</span>
                  <p className="text-[11px] text-zinc-300 leading-tight">Shifted user roles before payment setup.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 font-mono block">Cascade Executed</span>
                  <p className="text-[11px] text-zinc-300 leading-tight">Buffered analytics task by 3 days.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Analytics Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-2">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
              <Folder className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{metrics.totalProjects}</p>
            <p className="text-[11px] text-zinc-500">Sandbox + Active repositories</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-2">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Sprint progress</span>
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">
              {Math.round((metrics.completedTasksCount / metrics.overallTasksCount) * 100)}%
            </p>
            <p className="text-[11px] text-zinc-500">{metrics.completedTasksCount} of {metrics.overallTasksCount} issues resolved</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-2">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Risk Score</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-white">{metrics.avgRiskScore}%</p>
            <p className="text-[11px] text-zinc-500">Calculated across deliverables</p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-2">
            <div className="flex justify-between items-center text-zinc-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Sprint Velocity</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">32 SP</p>
            <p className="text-[11px] text-zinc-500">Avg completed story points</p>
          </div>

        </div>

        {/* Charts & AI Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Panel */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Historical Sprint Velocity</h3>
              <p className="text-xs text-zinc-500">Story points planned vs actually completed.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="completed" name="Completed SP" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="goal" name="Planned SP" stroke="#06b6d4" strokeWidth={1} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Suggestions Side Panel */}
          <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 flex flex-col">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>AI Engineering Insights</span>
              </h3>
              <p className="text-xs text-zinc-500">Autonomous co-pilot sprint recommendations.</p>
            </div>

            <div className="flex-1 space-y-4 text-sm text-zinc-300">
              <div className="p-3.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">Next Recommended Deliverable</span>
                <p className="font-semibold text-white">Setup database connection configurations</p>
                <p className="text-xs text-zinc-400">Next logic stack pending in portal-backend milestone backlog.</p>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-500/10 bg-amber-500/5 space-y-1">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">Blocker Alert</span>
                <p className="text-xs text-zinc-400">Issue #14 depends on Issue #12 which is still marked as Backlog. Assign Issue #12 first.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Demo Simulations & Milestones Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AI Multi-Agent Simulation console */}
          <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span>LangGraph Agent Monitor</span>
                </h3>
                <p className="text-xs text-zinc-500">Live multi-agent graph state transitions.</p>
              </div>
              <button
                onClick={runSimulation}
                disabled={simulating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-xs text-white transition-all cursor-pointer shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{simulating ? 'Running...' : 'Run Simulation'}</span>
              </button>
            </div>

            <div className="flex-1 min-h-[220px] max-h-[280px] overflow-y-auto p-4 rounded-lg bg-black/60 border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-2.5">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={`${
                  log.startsWith('[System]') 
                    ? 'text-indigo-400 font-semibold' 
                    : log.includes('WARNING') 
                    ? 'text-amber-400 font-bold' 
                    : log.startsWith('[Planner')
                    ? 'text-sky-400'
                    : log.startsWith('[Issue')
                    ? 'text-purple-400'
                    : log.startsWith('[Risk')
                    ? 'text-emerald-400'
                    : 'text-zinc-300'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Active Milestones Tracker */}
          <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Milestone className="h-4 w-4 text-sky-400" />
                <span>Enterprise Project Roadmap</span>
              </h3>
              <p className="text-xs text-zinc-500">Active milestones and progression.</p>
            </div>

            <div className="space-y-4">
              <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 p-1 rounded-full bg-emerald-500 text-black">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Phase 1: Project Alignment</span>
                      <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">100%</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Extract goals, requirements, and configure basic backlog.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 p-1 rounded-full bg-indigo-500 text-white">
                    <Activity className="h-3 w-3 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Phase 2: Core Setup</span>
                      <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/25">80% Active</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">Configure workspace database connection and node setup.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 p-1 rounded-full bg-zinc-800 text-zinc-500">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                      <span className="font-bold">Phase 3: Automated QA</span>
                      <span>Scheduled</span>
                    </div>
                    <p className="text-[11px] text-zinc-650 mt-1">Identify dependency conflicts and potential limits.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 flex flex-col">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>Recent Activity</span>
              </h3>
              <p className="text-xs text-zinc-500">Live operational events in your workspace.</p>
            </div>

            <div className="flex-1 space-y-4 max-h-[280px] overflow-y-auto pr-1">
              {[
                {
                  event: "Sprint 5 completed",
                  detail: "Velocity metric computed at 32 Story Points.",
                  time: "10 mins ago",
                  icon: "check"
                },
                {
                  event: "AI Report Generated",
                  detail: "AI Research & Architecture Audit created.",
                  time: "1 hour ago",
                  icon: "doc"
                },
                {
                  event: "PR Review Completed",
                  detail: "Security audit finalized for pull request #89.",
                  time: "3 hours ago",
                  icon: "pr"
                },
                {
                  event: "PRD Document Analyzed",
                  detail: "Extracted 24 tasks for milestone MVP Setup.",
                  time: "Yesterday",
                  icon: "upload"
                }
              ].map((act, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center shrink-0">
                    {act.icon === 'check' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                    {act.icon === 'doc' && <Zap className="h-3 w-3 text-indigo-400" />}
                    {act.icon === 'pr' && <Terminal className="h-3 w-3 text-cyan-400" />}
                    {act.icon === 'upload' && <Plus className="h-3 w-3 text-sky-400" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{act.event}</span>
                      <span className="text-[10px] text-zinc-500">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Active Projects Grid */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Workspaces</h3>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-44 rounded-xl border border-zinc-200/10 bg-zinc-900/20 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-12 rounded-xl border border-zinc-200/10 bg-zinc-900/10 space-y-4">
              <p className="text-zinc-500 text-sm">No active workspaces detected. Start by uploading a PRD file.</p>
              <Link 
                href="/items/add" 
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-200/10 text-sm font-semibold hover:bg-zinc-800 cursor-pointer"
              >
                Create Workspace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Link 
                  key={project._id} 
                  href={`/projects/${project._id}`}
                  className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between h-44 hover:shadow-glow cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[80%] flex items-center gap-1.5">
                        <span className="shrink-0">{project.thumbnail || '🚀'}</span>
                        <span className="truncate">{project.name}</span>
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        project.priority === 'urgent' 
                          ? 'border border-red-500/20 bg-red-500/5 text-red-400' 
                          : project.priority === 'high'
                          ? 'border border-amber-500/20 bg-amber-500/5 text-amber-400'
                          : 'border border-zinc-700 bg-zinc-800 text-zinc-400'
                      }`}>
                        {project.priority}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-200/10 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3.5">
                      {project.health && (
                        <div className="flex items-center gap-1.5" title={`Health Status: ${project.health.status}`}>
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            project.health.statusColor === 'green' ? 'bg-emerald-500' :
                            project.health.statusColor === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          <span className="font-mono text-zinc-300 font-semibold">{project.health.score}% Health</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-zinc-500">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
                        <span>{project.riskScore}% Risk</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-0.5 text-indigo-400 group-hover:text-white font-medium transition-colors">
                      <span>Workspace</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
