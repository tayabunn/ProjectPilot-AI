'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Brain, Map, ListTodo, ShieldAlert, ArrowUpDown,
  CheckCircle2, ChevronDown, ChevronUp, X, Play, RefreshCw,
  Sparkles, AlertTriangle, Clock, Zap, Target, GitBranch, Users,
} from 'lucide-react';

export interface AgentStageData {
  prdSnippet?: string;
  wordCount?: number;
  sections?: string[];
  functionalReqs?: { id: string; text: string; priority: string }[];
  nonFunctionalReqs?: string[];
  milestones?: { name: string; date: string; owner: string; status: string }[];
  tasks?: { title: string; sp: number; priority: string; deps: string[] }[];
  risks?: { title: string; severity: string; likelihood: string; mitigation: string }[];
  prioritized?: { rank: number; title: string; reason: string; score: number }[];
}

type StageStatus = 'idle' | 'running' | 'done';

interface PipelineStage {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  durationMs: number;
  description: string;
}

interface AgentReasoningPanelProps {
  onClose: () => void;
  projectName?: string;
  stageData?: AgentStageData;
}

const STAGES: PipelineStage[] = [
  {
    id: 'read_prd', label: 'Reading PRD', icon: FileText, color: 'text-violet-400', durationMs: 1400,
    description: 'Parsing the PRD document and identifying document structure and key sections.',
  },
  {
    id: 'understand_reqs', label: 'Understanding Requirements', icon: Brain, color: 'text-indigo-400', durationMs: 1800,
    description: 'Extracting functional and non-functional requirements. Resolving ambiguities and classifying priorities.',
  },
  {
    id: 'generate_roadmap', label: 'Generating Roadmap', icon: Map, color: 'text-blue-400', durationMs: 2000,
    description: 'Synthesizing milestones and delivery phases from requirements with estimated timelines.',
  },
  {
    id: 'create_tasks', label: 'Creating Tasks', icon: ListTodo, color: 'text-cyan-400', durationMs: 1600,
    description: 'Decomposing milestones into sprint-ready tasks with story points and dependency mapping.',
  },
  {
    id: 'analyze_risks', label: 'Analyzing Risks', icon: ShieldAlert, color: 'text-amber-400', durationMs: 1500,
    description: 'Scanning for delivery risks, technical debt signals, integration blockers, and timeline threats.',
  },
  {
    id: 'prioritize', label: 'Prioritizing', icon: ArrowUpDown, color: 'text-emerald-400', durationMs: 1200,
    description: 'Stack-ranking tasks by business value, dependency order, and risk exposure using RICE scoring.',
  },
];

function buildDefaultData(projectName = 'Current Project'): AgentStageData {
  return {
    prdSnippet: `# Product Requirement Document\n\n## Overview\nThis document defines the core product vision and functional requirements for ${projectName}. The system must support real-time collaboration, AI-driven task management, and seamless third-party integrations.\n\n## Objective\nDeliver a production-ready SaaS platform that reduces project management overhead by 40% through intelligent automation.`,
    wordCount: 1842,
    sections: [
      'Executive Summary', 'User Personas', 'Functional Requirements',
      'Non-Functional Requirements', 'API Specs', 'Security', 'Success Metrics',
    ],
    functionalReqs: [
      { id: 'FR-01', text: 'User authentication with JWT and OAuth 2.0', priority: 'Critical' },
      { id: 'FR-02', text: 'AI-powered task generation from PRD documents', priority: 'Critical' },
      { id: 'FR-03', text: 'Real-time Kanban board with drag-and-drop', priority: 'High' },
      { id: 'FR-04', text: 'Sprint planning with velocity tracking and burndown charts', priority: 'High' },
      { id: 'FR-05', text: 'Automated risk assessment with configurable thresholds', priority: 'Medium' },
      { id: 'FR-06', text: 'Multi-audience report generation (CEO, Developer, Investor)', priority: 'Medium' },
      { id: 'FR-07', text: 'GitHub repository sync for issues, PRs, commits, branches', priority: 'Medium' },
    ],
    nonFunctionalReqs: [
      'Response time < 200ms for all API endpoints (p95)',
      'System uptime >= 99.9% SLA',
      'SOC 2 Type II compliance for data handling',
      'Horizontal scaling to 10,000 concurrent users',
    ],
    milestones: [
      { name: 'Phase 1 - Foundation', date: 'Week 2', owner: 'Backend Team', status: 'done' },
      { name: 'Phase 2 - AI Core', date: 'Week 5', owner: 'AI Team', status: 'in-progress' },
      { name: 'Phase 3 - Integrations', date: 'Week 8', owner: 'Platform Team', status: 'pending' },
      { name: 'Phase 4 - Polish & Beta', date: 'Week 11', owner: 'Full Team', status: 'pending' },
    ],
    tasks: [
      { title: 'Set up Express API with JWT middleware', sp: 3, priority: 'urgent', deps: [] },
      { title: 'Design MongoDB schema for Projects & Tasks', sp: 2, priority: 'high', deps: [] },
      { title: 'Build PRD parsing agent (LangChain)', sp: 5, priority: 'urgent', deps: ['MongoDB schema'] },
      { title: 'Create Kanban board with drag-and-drop', sp: 5, priority: 'high', deps: ['Express API'] },
      { title: 'Implement Sprint velocity tracking', sp: 3, priority: 'medium', deps: ['Kanban board'] },
      { title: 'GitHub API integration for sync', sp: 4, priority: 'medium', deps: ['Express API'] },
    ],
    risks: [
      { title: 'LLM hallucinations in task generation', severity: 'High', likelihood: 'Medium', mitigation: 'Add validation layer with human-in-the-loop review for critical tasks' },
      { title: 'GitHub API rate limiting (5000 req/hr)', severity: 'Medium', likelihood: 'High', mitigation: 'Implement smart caching with Redis and exponential backoff' },
      { title: 'JWT secret rotation without downtime', severity: 'High', likelihood: 'Low', mitigation: 'Use rolling key rotation with dual-token acceptance window' },
      { title: 'MongoDB connection pool exhaustion under load', severity: 'Medium', likelihood: 'Medium', mitigation: 'Configure max pool size and add connection health checks' },
    ],
    prioritized: [
      { rank: 1, title: 'Set up Express API with JWT middleware', reason: 'Foundation for all other tasks', score: 98 },
      { rank: 2, title: 'Design MongoDB schema for Projects & Tasks', reason: 'Blocks 4 downstream tasks', score: 94 },
      { rank: 3, title: 'Build PRD parsing agent (LangChain)', reason: 'Core AI feature, high business value', score: 89 },
      { rank: 4, title: 'Create Kanban board with drag-and-drop', reason: 'Key user-facing feature', score: 82 },
      { rank: 5, title: 'GitHub API integration for sync', reason: 'Developer adoption driver', score: 75 },
      { rank: 6, title: 'Implement Sprint velocity tracking', reason: 'Analytics, lower urgency', score: 60 },
    ],
  };
}

// ─── Per-Stage Inspection Content ────────────────────────────────────────────

function StageInspection({ stageId, data }: { stageId: string; data: AgentStageData }) {
  if (stageId === 'read_prd') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <span className="px-2 py-1 rounded bg-violet-900/50 text-violet-300 border border-violet-500/30">
            {data.wordCount?.toLocaleString()} words
          </span>
          <span className="px-2 py-1 rounded bg-violet-900/50 text-violet-300 border border-violet-500/30">
            {data.sections?.length} sections detected
          </span>
        </div>
        <div>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Document Sections</p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.sections?.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-300">
                <span className="w-4 h-4 rounded bg-violet-800/60 text-violet-400 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">PRD Snippet</p>
          <pre className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-700/50 text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {data.prdSnippet}
          </pre>
        </div>
      </div>
    );
  }

  if (stageId === 'understand_reqs') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Functional Requirements</p>
          <div className="space-y-1.5">
            {data.functionalReqs?.map((req) => (
              <div key={req.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40">
                <span className="font-mono text-[10px] text-indigo-400 font-bold shrink-0 pt-0.5">{req.id}</span>
                <span className="text-xs text-zinc-300 flex-1">{req.text}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${req.priority === 'Critical' ? 'bg-red-950/60 text-red-400' : req.priority === 'High' ? 'bg-amber-950/60 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {req.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Non-Functional Requirements</p>
          {data.nonFunctionalReqs?.map((nfr, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 px-2 py-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
              {nfr}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stageId === 'generate_roadmap') {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Generated Milestones</p>
        <div className="relative pl-5">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/60 to-transparent" />
          {data.milestones?.map((m, i) => (
            <div key={i} className="relative mb-3 last:mb-0">
              <div className={`absolute -left-5 top-2.5 w-2.5 h-2.5 rounded-full border-2 ${m.status === 'done' ? 'bg-emerald-500 border-emerald-400' : m.status === 'in-progress' ? 'bg-blue-500 border-blue-400 animate-pulse' : 'bg-zinc-700 border-zinc-600'}`} />
              <div className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/40">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{m.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${m.status === 'done' ? 'bg-emerald-900/60 text-emerald-400' : m.status === 'in-progress' ? 'bg-blue-900/60 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex gap-3 mt-1 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.date}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.owner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stageId === 'create_tasks') {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          Task Breakdown ({data.tasks?.length} tasks generated)
        </p>
        {data.tasks?.map((t, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${t.priority === 'urgent' ? 'bg-red-950/60 text-red-400' : t.priority === 'high' ? 'bg-amber-950/60 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {t.priority}
            </span>
            <span className="text-xs text-zinc-300 flex-1">{t.title}</span>
            <span className="text-[11px] font-mono text-cyan-400 shrink-0">{t.sp} SP</span>
            {t.deps.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-500 shrink-0">
                <GitBranch className="w-3 h-3" />{t.deps.length}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (stageId === 'analyze_risks') {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          Risk Matrix ({data.risks?.length} risks identified)
        </p>
        {data.risks?.map((r, i) => (
          <div key={i} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/40 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${r.severity === 'High' ? 'text-red-400' : r.severity === 'Medium' ? 'text-amber-400' : 'text-zinc-400'}`} />
                {r.title}
              </span>
              <div className="flex gap-1.5 shrink-0">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${r.severity === 'High' ? 'bg-red-950/60 text-red-400' : 'bg-amber-950/60 text-amber-400'}`}>
                  Sev: {r.severity}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Prob: {r.likelihood}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 pl-5">
              <span className="text-zinc-400 font-medium">Mitigation: </span>{r.mitigation}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (stageId === 'prioritize') {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">RICE-Scored Priority Stack</p>
        {data.prioritized?.map((p) => (
          <div key={p.rank} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${p.rank === 1 ? 'bg-emerald-800/80 text-emerald-300' : p.rank === 2 ? 'bg-blue-800/80 text-blue-300' : p.rank === 3 ? 'bg-violet-800/80 text-violet-300' : 'bg-zinc-700 text-zinc-400'}`}>
              {p.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-200 font-medium truncate">{p.title}</p>
              <p className="text-[11px] text-zinc-500">{p.reason}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-bold font-mono text-emerald-400">{p.score}</div>
              <div className="w-16 h-1 rounded-full bg-zinc-700 mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${p.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgentReasoningPanel({
  onClose,
  projectName = 'Current Project',
  stageData: externalData,
}: AgentReasoningPanelProps) {
  const data = externalData ?? buildDefaultData(projectName);

  const [statuses, setStatuses] = useState<Record<string, StageStatus>>(
    STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 'idle' as StageStatus }), {} as Record<string, StageStatus>)
  );
  const [progress, setProgress] = useState<Record<string, number>>(
    STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {} as Record<string, number>)
  );
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [allDone, setAllDone] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRefs = React.useRef<Record<string, any>>({});

  const reset = useCallback(() => {
    Object.values(timerRefs.current).forEach((id) => clearInterval(id));
    timerRefs.current = {};
    setStatuses(STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 'idle' as StageStatus }), {} as Record<string, StageStatus>));
    setProgress(STAGES.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {} as Record<string, number>));
    setIsRunning(false);
    setAllDone(false);
    setExpandedStage(null);
  }, []);

  const runPipeline = useCallback(() => {
    if (isRunning) return;
    reset();
    setIsRunning(true);
    let delay = 300;

    STAGES.forEach((stage, idx) => {
      const startAt = delay;
      delay += stage.durationMs + 200;

      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [stage.id]: 'running' }));
        const stepMs = 30;
        const totalSteps = stage.durationMs / stepMs;
        let step = 0;

        const iv = setInterval(() => {
          step++;
          const pct = Math.min(100, Math.round((step / totalSteps) * 100));
          setProgress(prev => ({ ...prev, [stage.id]: pct }));
          if (pct >= 100) {
            clearInterval(iv);
            delete timerRefs.current[stage.id];
            setStatuses(prev => ({ ...prev, [stage.id]: 'done' }));
            if (idx === STAGES.length - 1) {
              setIsRunning(false);
              setAllDone(true);
            }
          }
        }, stepMs);

        timerRefs.current[stage.id] = iv;
      }, startAt);
    });
  }, [isRunning, reset]);

  useEffect(() => {
    return () => { Object.values(timerRefs.current).forEach((id) => clearInterval(id)); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-700/60 bg-zinc-950 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Agent Reasoning Pipeline</h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                {isRunning
                  ? 'Executing pipeline...'
                  : allDone
                  ? 'Complete — click any stage to inspect intermediate reasoning'
                  : `Interactive AI reasoning visualization for ${projectName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allDone && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
            {!isRunning && !allDone && (
              <button
                onClick={runPipeline}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <Play className="w-3.5 h-3.5" /> Run Pipeline
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">

          {/* Pipeline stages */}
          <div className="relative">
            <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/40 via-zinc-700/30 to-transparent pointer-events-none" />
            <div className="space-y-2">
              {STAGES.map((stage, idx) => {
                const status = statuses[stage.id];
                const pct = progress[stage.id];
                const Icon = stage.icon;
                const isDone = status === 'done';
                const isRunningStage = status === 'running';
                const isExpanded = expandedStage === stage.id;

                return (
                  <div key={stage.id}>
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDone ? 'cursor-pointer' : 'cursor-default'} ${
                        isDone
                          ? isExpanded
                            ? 'border-indigo-500/50 bg-indigo-950/30'
                            : 'border-zinc-700/60 bg-zinc-900/40 hover:border-zinc-600'
                          : isRunningStage
                          ? 'border-indigo-500/40 bg-indigo-950/20'
                          : 'border-zinc-800/60 bg-zinc-900/20 opacity-50'
                      }`}
                      onClick={() => { if (isDone) setExpandedStage(prev => prev === stage.id ? null : stage.id); }}
                    >
                      {/* Stage icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10 border-2 transition-all ${
                        isDone
                          ? 'border-emerald-500/60 bg-emerald-950/60 shadow-lg shadow-emerald-500/20'
                          : isRunningStage
                          ? 'border-indigo-500/60 bg-indigo-950/60 animate-pulse'
                          : 'border-zinc-700 bg-zinc-800/60'
                      }`}>
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : <Icon className={`w-4 h-4 ${isRunningStage ? stage.color : 'text-zinc-500'}`} />
                        }
                      </div>

                      {/* Stage content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${isDone ? 'text-zinc-100' : isRunningStage ? 'text-white' : 'text-zinc-500'}`}>
                            {stage.label}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isRunningStage && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-300 animate-pulse">
                                <Zap className="w-3 h-3" /> Processing...
                              </span>
                            )}
                            {isDone && <span className="text-[10px] font-mono text-emerald-400 font-bold">Done</span>}
                            {status === 'idle' && idx > 0 && <span className="text-[10px] font-mono text-zinc-600">Queued</span>}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-75 ${
                              isDone
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                : isRunningStage
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-500'
                                : 'bg-zinc-700'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {isRunningStage && (
                          <p className="text-[11px] text-zinc-500">{stage.description}</p>
                        )}
                      </div>

                      {isDone && (
                        isExpanded
                          ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                    </div>

                    {/* Inspection drawer */}
                    {isExpanded && isDone && (
                      <div className="ml-14 mt-1 mb-2 p-4 rounded-xl border border-indigo-500/20 bg-zinc-900/60">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                            Intermediate Reasoning — {stage.label}
                          </span>
                        </div>
                        <StageInspection stageId={stage.id} data={data} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Done banner */}
          {allDone && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">Pipeline Complete</p>
                  <p className="text-[11px] text-zinc-400">
                    All {STAGES.length} stages processed. Click any stage above to inspect intermediate reasoning.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
                  {data.tasks?.length ?? 0} tasks generated
                </span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-1 rounded">
                  {data.risks?.length ?? 0} risks found
                </span>
              </div>
            </div>
          )}

          {/* Idle state */}
          {!isRunning && !allDone && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <p className="text-zinc-300 font-semibold">Ready to inspect the AI reasoning pipeline</p>
                <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                  Press <strong className="text-white">Run Pipeline</strong> to watch the agent process your project in real-time, then click any completed stage to inspect intermediate data.
                </p>
              </div>
              <button
                onClick={runPipeline}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-xl shadow-indigo-500/30 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Run Agent Pipeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
