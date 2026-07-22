'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/services/api';
import { 
  Terminal, 
  Sparkles, 
  Kanban, 
  Milestone as MilestoneIcon, 
  FileText, 
  MessageSquare,
  AlertTriangle,
  Play,
  CheckCircle2,
  Plus,
  Send,
  Download,
  Clock,
  Layers,
  Folder,
  ArrowLeft,
  CalendarRange,
  TrendingUp,
  FileText as ReportIcon,
  Activity as BurndownIcon,
  GitMerge,
  ShieldCheck,
  Cpu,
  Target,
  Briefcase,
  Users,
  Code2,
  DollarSign,
  History,
  Rocket,
  CheckSquare,
  Square,
  GitPullRequest,
  GitCommit,
  GitBranch,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Zap,
  ArrowRight,
  Mic,
  MicOff,
  Search,
  Brain,
  HelpCircle,
  Command
} from 'lucide-react';

import CommandPalette from '@/components/CommandPalette';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import AgentReasoningPanel from '@/components/AgentReasoningPanel';


import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface Project {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  riskScore: number;
  thumbnail?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints: number;
  estimatedHours: number;
  labels: string[];
  milestoneId?: string;
  sprintId?: string;
  dependencies?: string[];
}

interface Milestone {
  _id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'pending' | 'completed';
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'dependencies' | 'roadmap' | 'sprints' | 'reports' | 'github' | 'chat'>('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any | null>(null);
  const [releaseReadiness, setReleaseReadiness] = useState<any | null>(null);
  const [githubData, setGithubData] = useState<any | null>(null);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [burndownPrediction, setBurndownPrediction] = useState<any | null>(null);
  const [smartAssignData, setSmartAssignData] = useState<any | null>(null);
  const [assignModalTask, setAssignModalTask] = useState<Task | null>(null);
  const [reprioritizeLoading, setReprioritizeLoading] = useState(false);
  const [cascadeResult, setCascadeResult] = useState<any | null>(null);

  // AI Enhancements States
  const [userMemory, setUserMemory] = useState<any | null>(null);
  const [memoryReused, setMemoryReused] = useState<{ [key: string]: boolean }>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingNotesList, setMeetingNotesList] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // UI Polish & Shortcuts States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [agentReasoningOpen, setAgentReasoningOpen] = useState(false);



  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{ [taskId: string]: HTMLDivElement | null }>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [delayDays, setDelayDays] = useState<number>(5);
  const [selectedAudience, setSelectedAudience] = useState<'ceo' | 'pm' | 'developer' | 'investor'>('ceo');

  useEffect(() => {
    setDelayDays(5);
  }, [selectedTaskId]);

  // Sugiyama Layout Tier assignment
  const getTaskTiers = (tasksList: Task[]) => {
    const tiers: { [taskId: string]: number } = {};
    const taskMap = new Map<string, Task>();
    tasksList.forEach(t => taskMap.set(t._id, t));

    const calculateTier = (taskId: string, visited: Set<string>): number => {
      if (tiers[taskId] !== undefined) return tiers[taskId];
      if (visited.has(taskId)) return 0;
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        tiers[taskId] = 0;
        return 0;
      }

      let maxDepTier = -1;
      task.dependencies.forEach(depId => {
        maxDepTier = Math.max(maxDepTier, calculateTier(depId.toString(), new Set(visited)));
      });

      tiers[taskId] = maxDepTier + 1;
      return tiers[taskId];
    };

    tasksList.forEach(t => calculateTier(t._id, new Set()));
    return tiers;
  };

  const getBlockerSet = (taskId: string | null): Set<string> => {
    const blockers = new Set<string>();
    if (!taskId) return blockers;

    const dfs = (id: string) => {
      const task = tasks.find(t => t._id === id);
      if (!task || !task.dependencies) return;
      task.dependencies.forEach(depId => {
        const depStr = depId.toString();
        if (!blockers.has(depStr)) {
          blockers.add(depStr);
          dfs(depStr);
        }
      });
    };

    dfs(taskId);
    return blockers;
  };

  const getDownstreamSet = (taskId: string | null): Set<string> => {
    const downstream = new Set<string>();
    if (!taskId) return downstream;

    const dfs = (id: string) => {
      tasks.forEach(t => {
        if (t.dependencies && t.dependencies.map(d => d.toString()).includes(id)) {
          if (!downstream.has(t._id)) {
            downstream.add(t._id);
            dfs(t._id);
          }
        }
      });
    };

    dfs(taskId);
    return downstream;
  };

  const selectedBlockers = getBlockerSet(selectedTaskId);
  const selectedDownstream = getDownstreamSet(selectedTaskId);

  const recalculateLines = () => {
    if (!containerRef.current || activeTab !== 'dependencies') return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tempConnections: any[] = [];

    tasks.forEach(task => {
      const fromEl = nodeRefs.current[task._id];
      if (!fromEl) return;

      const fromRect = fromEl.getBoundingClientRect();

      task.dependencies?.forEach(depId => {
        const toEl = nodeRefs.current[depId.toString()];
        if (!toEl) return;

        const toRect = toEl.getBoundingClientRect();
        
        const blockerX = toRect.right - containerRect.left;
        const blockerY = toRect.top + toRect.height / 2 - containerRect.top;
        const dependentX = fromRect.left - containerRect.left;
        const dependentY = fromRect.top + fromRect.height / 2 - containerRect.top;

        tempConnections.push({
          id: `${depId.toString()}-${task._id}`,
          fromId: depId.toString(),
          toId: task._id,
          fromX: blockerX,
          fromY: blockerY,
          toX: dependentX,
          toY: dependentY
        });
      });
    });

    setConnections(tempConnections);
  };

  // Global Keyboard Shortcuts Listener

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings if typing inside inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Cmd + K or Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      // '?' key -> Shortcuts Guide
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(prev => !prev);
        return;
      }

      // '/' key -> Workspace Search
      if (e.key === '/') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
        return;
      }

      // Sequence keybindings (e.g. G then O)
      const now = Date.now();
      const key = e.key.toLowerCase();

      if (key === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
        return;
      }

      if (lastKey === 'g' && (now - lastKeyTime < 1000)) {
        if (key === 'o') setActiveTab('overview');
        else if (key === 'k') setActiveTab('kanban');
        else if (key === 'd') setActiveTab('dependencies');
        else if (key === 's') setActiveTab('sprints');
        else if (key === 'r') setActiveTab('reports');
        else if (key === 'g') setActiveTab('github');
        else if (key === 'c') setActiveTab('chat');
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  // Reports Management State
  const [genReportText, setGenReportText] = useState('');
  const [genReportType, setGenReportType] = useState<'weekly_report' | 'sprint_report' | 'project_report' | 'risk_report'>('weekly_report');
  const [genReportLoading, setGenReportLoading] = useState(false);
  const [genReportStyle, setGenReportStyle] = useState('professional');
  const [genReportLength, setGenReportLength] = useState('medium');
  const [newlyCreatedReportId, setNewlyCreatedReportId] = useState<string | null>(null);

  // Sprint Report State
  const [sprintReportText, setSprintReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  
  // Tasks Form State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskSP, setTaskSP] = useState(2);

  // Recommendations State
  const [recsLoading, setRecsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  // AI Chat State
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "What should the team build next?",
    "Are there any delivery risk factors?",
    "Generate a summary release report."
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [decisionLogs, setDecisionLogs] = useState<any[]>([]);

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.project);
      setTasks(res.data.tasks || []);
      setMilestones(res.data.milestones || []);
      setSprints(res.data.sprints || []);
      setReports(res.data.reports || []);
      setHealth(res.data.health || null);
      setReleaseReadiness(res.data.releaseReadiness || null);

      // Fetch Decision Logs
      try {
        const logRes = await api.get(`/decision-logs/${projectId}`);
        setDecisionLogs(logRes.data.logs || []);
      } catch (e) {
        console.log("No decision logs found yet.");
      }

      // Fetch GitHub Sync Data
      try {
        const ghRes = await api.get(`/github/${projectId}`);
        setGithubData(ghRes.data.github || null);
      } catch (e) {
        console.log("No github sync data found yet.");
      }

      // Fetch Sprint Burndown Prediction
      try {
        const burnRes = await api.get(`/engineering/burndown/${projectId}`);
        setBurndownPrediction(burnRes.data.prediction || null);
      } catch (e) {
        console.log("No burndown prediction found yet.");
      }

      // Fetch User Memory (Long-Term Memory)
      try {
        const memRes = await api.get('/ai-enhancements/memory');
        setUserMemory(memRes.data.memory || null);
      } catch (e) {
        console.log("No user memory found yet.");
      }

      // Fetch Meeting Notes
      try {
        const mnRes = await api.get(`/ai-enhancements/meeting-notes/${projectId}`);
        setMeetingNotesList(mnRes.data.notes || []);
      } catch (e) {
        console.log("No meeting notes found yet.");
      }

      
      // Seed default history
      if (res.data.project) {
        setChatHistory([
          { 
            sender: 'assistant', 
            content: `Hello! I am **ProjectPilot**, your AI Engineering Manager. \n\nI have parsed your workspace guidelines and structured the initial task backlog. You can run automated analysis, update task columns, or request report document writeups.\n\n[Suggest: What should we build next?]`, 
            timestamp: new Date().toISOString() 
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const res = await api.get('/projects');
      setAllProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncGithub = async () => {
    setGithubSyncing(true);
    try {
      const res = await api.post(`/github/${projectId}/sync`);
      setGithubData(res.data.github);
    } catch (err) {
      console.error('Failed to sync github repository', err);
    } finally {
      setGithubSyncing(false);
    }
  };

  const handleSmartAssign = async (task: Task) => {
    setAssignModalTask(task);
    setSmartAssignData(null);
    try {
      const res = await api.get(`/engineering/assignment/${task._id}`);
      setSmartAssignData(res.data.recommendation);
    } catch (err) {
      console.error('Failed to get smart assignment', err);
    }
  };

  const handleTriggerReprioritization = async (customEvent?: string) => {
    setReprioritizeLoading(true);
    try {
      const res = await api.post(`/engineering/reprioritize/${projectId}`, {
        event: customEvent || 'Payment API failed due to webhook signature mismatch'
      });
      setCascadeResult(res.data.cascade);
      fetchProjectDetails();
    } catch (err) {
      console.error('Failed to trigger cascade reprioritization', err);
    } finally {
      setReprioritizeLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchAllProjects();
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, typingText]);

  // AI Recommendations
  const loadAIRecommendations = async () => {
    setRecsLoading(true);
    try {
      const res = await api.post('/tasks/recommendations', { projectId });
      setRecommendation(res.data.recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    if (project && activeTab === 'overview') {
      loadAIRecommendations();
    }
  }, [project, activeTab]);

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const res = await api.post('/tasks', {
        projectId,
        title: taskTitle,
        description: taskDesc,
        status: 'todo',
        priority: taskPriority,
        storyPoints: taskSP
      });
      setTasks(prev => [...prev, res.data]);
      setTaskTitle('');
      setTaskDesc('');
      setShowTaskForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Move Task Status (simulates Kanban drag-drop columns)
  const handleMoveTask = async (taskId: string, nextStatus: Task['status']) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, nextStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    await handleMoveTask(taskId, nextStatus);
  };

  // Chat Submission with Fetch Stream
  const handleSendChat = async (messageText: string) => {
    if (!messageText.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMsg('');
    setChatLoading(true);
    setTypingText('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, message: messageText })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  responseText += parsed.text;
                  setTypingText(responseText);
                }
              } catch (e) {
                // Ignore raw strings
              }
            }
          }
        }
      }

      // Finalize message response
      // Parse suggested prompts if present
      const suggestRegex = /\[Suggest:\s*(.*?)\]/g;
      const suggestions: string[] = [];
      let match;
      while ((match = suggestRegex.exec(responseText)) !== null) {
        if (match[1]) suggestions.push(match[1]);
      }
      
      const cleanResponse = responseText.replace(suggestRegex, '').trim();

      setChatHistory(prev => [...prev, {
        sender: 'assistant',
        content: cleanResponse || 'Analysis completed.',
        timestamp: new Date().toISOString()
      }]);
      
      if (suggestions.length > 0) {
        setSuggestedPrompts(suggestions);
      } else {
        setSuggestedPrompts([
          "What should the team build next?",
          "Are there any delivery risk factors?",
          "Generate a summary release report."
        ]);
      }

    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        sender: 'assistant',
        content: 'Failed to communicate with AI model.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
      setTypingText('');
    }
  };

  // Command Palette Action Router
  const handleSelectCommandAction = (actionId: string) => {
    switch (actionId) {
      case 'nav_overview': setActiveTab('overview'); break;
      case 'nav_kanban': setActiveTab('kanban'); break;
      case 'nav_dependencies': setActiveTab('dependencies'); break;
      case 'nav_sprints': setActiveTab('sprints'); break;
      case 'nav_reports': setActiveTab('reports'); break;
      case 'nav_github': setActiveTab('github'); break;
      case 'nav_chat': setActiveTab('chat'); break;
      case 'action_search': setSearchModalOpen(true); break;
      case 'action_voice': toggleVoiceListening(); break;
      case 'action_cascade': handleTriggerReprioritization('Triggered from Command Palette'); break;
      case 'action_report': setActiveTab('reports'); handleCompileReport(); break;
      case 'action_meeting': setMeetingModalOpen(true); break;
      case 'action_create_sprint': handleCreateSprint(); break;
      case 'action_shortcuts': setShortcutsModalOpen(true); break;
      default: break;
    }
  };

  // AI Enhancements Handlers

  const handlePerformSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/ai-enhancements/search?projectId=${projectId}&query=${encodeURIComponent(queryText)}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleUploadMeetingNote = async () => {
    if (!meetingTranscript.trim()) return;
    setMeetingLoading(true);
    try {
      const res = await api.post('/ai-enhancements/meeting-notes', {
        projectId,
        title: meetingTitle || `Engineering Sync - ${new Date().toLocaleDateString()}`,
        transcript: meetingTranscript
      });
      if (res.data.success) {
        setMeetingTitle('');
        setMeetingTranscript('');
        setMeetingModalOpen(false);
        // Refresh project tasks and meeting notes
        await fetchProjectDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    try {
      await api.post('/sprints', {
        projectId,
        name: `Sprint ${sprints.length + 1}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000)
      });
      await fetchProjectDetails();
      setActiveTab('sprints');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteVoiceCommand = async (commandStr: string) => {

    const cmd = commandStr.toLowerCase().trim();
    setVoiceFeedback(`🎤 Command Recognized: "${commandStr}"`);

    setTimeout(() => {
      setVoiceFeedback(null);
    }, 4500);

    if (cmd.includes('sprint') || cmd.includes('create sprint')) {
      try {
        await api.post('/sprints', {
          projectId,
          name: `Sprint ${sprints.length + 1}`,
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000)
        });
        await fetchProjectDetails();
        setActiveTab('sprints');
      } catch (e) {
        console.error(e);
      }
    } else if (cmd.includes('report') || cmd.includes('generate report')) {
      setActiveTab('reports');
    } else if (cmd.includes('github') || cmd.includes('sync')) {
      setActiveTab('github');
    } else if (cmd.includes('repriorit') || cmd.includes('cascade')) {
      setActiveTab('kanban');
    } else if (cmd.includes('search') || cmd.includes('find')) {
      setSearchModalOpen(true);
    }
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    // Use Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleExecuteVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        // Fallback demo speech command if browser permission or API fails
        handleExecuteVoiceCommand("Create Sprint 4");
      };

      recognition.start();
    } else {
      // Fallback demo for browsers without WebSpeech support
      setTimeout(() => {
        setIsListening(false);
        handleExecuteVoiceCommand("Create Sprint 4");
      }, 2000);
    }
  };


  const handleGenerateSprintReport = async () => {
    setReportLoading(true);
    setSprintReportText('');
    try {
      const res = await api.post('/ai/generate-content', {
        projectId,
        contentType: 'sprint_report',
        style: 'professional',
        length: 'medium'
      });
      setSprintReportText(res.data.content);
    } catch (err) {
      console.error(err);
      setSprintReportText('Failed to generate sprint report. Please check backend connection.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCompileReport = async () => {
    setGenReportLoading(true);
    setGenReportText('');
    setNewlyCreatedReportId(null);
    try {
      const res = await api.post('/ai/generate-content', {
        projectId,
        contentType: genReportType,
        style: genReportStyle,
        length: genReportLength
      });
      setGenReportText(res.data.content);
      if (res.data.reportId) {
        setNewlyCreatedReportId(res.data.reportId);
        // Add to local list
        setReports(prev => [
          {
            _id: res.data.reportId,
            type: genReportType.replace('_report', ''),
            title: `${genReportType.replace('_', ' ').toUpperCase()} - ${new Date().toLocaleDateString()}`,
            summary: res.data.content.slice(0, 300) + '...',
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
      setGenReportText('Failed to compile report. Please check backend connection.');
    } finally {
      setGenReportLoading(false);
    }
  };

  if (loading || !project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
          <span>Loading project metrics...</span>
        </div>
      </DashboardLayout>
    );
  }

  const columns: { label: string; status: Task['status'] }[] = [
    { label: 'Backlog', status: 'backlog' },
    { label: 'To Do', status: 'todo' },
    { label: 'In Progress', status: 'in-progress' },
    { label: 'In Review', status: 'review' },
    { label: 'Done', status: 'done' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-2">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="shrink-0">{project.thumbnail || '🚀'}</span>
              <span>{project.name}</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Semantic Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-indigo-400" />
              <span>Search Workspace</span>
            </button>

            {/* Agent Reasoning Panel Button */}
            <button
              onClick={() => setAgentReasoningOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/40 bg-violet-950/50 hover:bg-violet-900/60 text-xs font-bold text-violet-300 transition-all cursor-pointer shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
            >
              <Cpu className="h-3.5 w-3.5 text-violet-400" />
              <span>Agent Reasoning</span>
            </button>

            {/* Voice Mode Button */}
            <button
              onClick={toggleVoiceListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? 'border-red-500/50 bg-red-950/60 text-red-300 animate-pulse'
                  : 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60'
              }`}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5 text-red-400 animate-bounce" /> : <Mic className="h-3.5 w-3.5 text-indigo-400" />}
              <span>{isListening ? 'Listening...' : 'Voice Mode'}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900/60 text-xs text-zinc-300 font-semibold uppercase">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Risk: {project.riskScore}%</span>
            </div>
          </div>
        </div>

        {/* Voice Feedback Banner */}
        {voiceFeedback && (
          <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-950/70 text-indigo-200 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
              {voiceFeedback}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">Executed Agentic Action</span>
          </div>
        )}


        {/* Tab Headers */}
        <div className="flex border-b border-zinc-200/10 text-sm gap-2 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'kanban', label: 'Kanban Board', icon: Kanban },
            { id: 'dependencies', label: 'Dependency Graph', icon: GitMerge },
            { id: 'roadmap', label: 'Roadmap', icon: MilestoneIcon },
            { id: 'sprints', label: 'Sprint Planning', icon: CalendarRange },
            { id: 'reports', label: 'AI Reports', icon: ReportIcon },
            { id: 'github', label: 'GitHub Sync', icon: GitPullRequest },
            { id: 'chat', label: 'AI Manager Chat', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'border-indigo-500 text-indigo-400' 
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contextual AI Suggestions Panel */}

        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/30 glass-panel flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse shrink-0" />
            <span className="text-zinc-300 font-bold uppercase tracking-wider">Contextual AI Suggestions:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {(() => {
              const suggestionsMap: Record<string, { label: string; action: () => void }[]> = {
                overview: [
                  { label: "🧠 Agent Reasoning", action: () => setAgentReasoningOpen(true) },
                  { label: "⚡ Audit Risk Score", action: () => handlePerformSearch("Risk Audit") },
                  { label: "🧠 Memory Reuse", action: () => handlePerformSearch("Tech stack preference") },
                  { label: "📊 Timeline Simulation", action: () => setSelectedTaskId(tasks[0]?._id || null) }
                ],
                kanban: [
                  { label: "🤖 Auto-Assign Tasks", action: () => setAssignModalTask(tasks.find(t => t.status !== 'done') || null) },
                  { label: "⚡ Cascade Reprioritization", action: () => handleTriggerReprioritization('Payment API failure') },
                  { label: "➕ Create Task", action: () => setShowTaskForm(true) }
                ],
                dependencies: [
                  { label: "🔀 Select Blocker", action: () => setSelectedTaskId(tasks.find(t => t.dependencies?.length)?.dependencies?.[0] || null) },
                  { label: "⏱️ Simulate 10-day Delay", action: () => setDelayDays(10) }
                ],
                roadmap: [
                  { label: "🎯 Requirement Coverage", action: () => setActiveTab('overview') }
                ],
                sprints: [
                  { label: "📈 Burndown Velocity", action: () => handlePerformSearch("Burndown velocity") },
                  { label: "➕ Create Sprint", action: handleCreateSprint }
                ],
                reports: [
                  { label: "💼 CEO Brief", action: () => setSelectedAudience('ceo') },
                  { label: "💻 Developer Worklog", action: () => setSelectedAudience('developer') },
                  { label: "📄 Upload Meeting Transcript", action: () => setMeetingModalOpen(true) }
                ],
                github: [
                  { label: "🔄 Force Sync", action: async () => { setGithubSyncing(true); await fetchProjectDetails(); setGithubSyncing(false); } }
                ],
                chat: [
                  { label: "💡 What build next?", action: () => handleSendChat("What should the team build next?") }
                ]
              };

              const currentSuggestions = suggestionsMap[activeTab] || suggestionsMap.overview;

              return currentSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={s.action}
                  className="px-3 py-1 rounded-lg border border-indigo-500/30 bg-indigo-900/40 hover:bg-indigo-900/80 text-indigo-200 hover:text-white font-medium text-[11px] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  {s.label}
                </button>
              ));
            })()}

            <button
              onClick={() => setShortcutsModalOpen(true)}
              className="p-1 rounded text-zinc-400 hover:text-white text-[10px] font-mono cursor-pointer shrink-0 ml-1"
              title="View Keyboard Shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4 text-zinc-500 hover:text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="pt-2">


          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Health Overview */}
              <div className="lg:col-span-2 space-y-6">

                {/* Dynamic AI-Generated Health Score Widget */}
                {health && (
                  <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 relative overflow-hidden">
                    {/* Glowing background hint */}
                    <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[80px] opacity-25 ${
                      health.statusColor === 'green' ? 'bg-emerald-500' :
                      health.statusColor === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            health.statusColor === 'green' ? 'bg-emerald-500 animate-pulse' :
                            health.statusColor === 'yellow' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
                          }`} />
                          <span>Project Health Status</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Live calculation of delivery stability and blockers.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          health.statusColor === 'green' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                          health.statusColor === 'yellow' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
                          'border-red-500/20 bg-red-500/10 text-red-400'
                        }`}>
                          {health.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                      {/* Big Score Visualizer */}
                      <div className="sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-955/40 border border-zinc-200/5 relative group">
                        <div className="relative flex items-center justify-center">
                          {/* Radial Progress/SVG Circle */}
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className="stroke-zinc-800"
                              strokeWidth="6"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className={`transition-all duration-1000 ${
                                health.statusColor === 'green' ? 'stroke-emerald-500' :
                                health.statusColor === 'yellow' ? 'stroke-amber-500' : 'stroke-red-500'
                              }`}
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray={(2 * Math.PI * 34).toString()}
                              strokeDashoffset={(2 * Math.PI * 34 * (1 - health.score / 100)).toString()}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-extrabold text-white font-mono">{health.score}</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase">/ 100</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Metrics breakdown */}
                      <div className="sm:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Timeline Risk</span>
                          <span className={`text-xs font-bold ${
                            health.timelineRisk === 'Low' ? 'text-emerald-400' :
                            health.timelineRisk === 'Medium' ? 'text-amber-400' :
                            health.timelineRisk === 'High' ? 'text-orange-400' : 'text-red-400'
                          }`}>{health.timelineRisk}</span>
                        </div>

                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Completeness</span>
                          <span className="text-xs font-bold text-white font-mono">{health.requirementCompleteness}%</span>
                        </div>

                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Sprint Velocity</span>
                          <span className={`text-xs font-bold ${
                            health.sprintVelocity === 'Improving' ? 'text-emerald-400' :
                            health.sprintVelocity === 'Stable' ? 'text-indigo-400' :
                            health.sprintVelocity === 'Declining' ? 'text-amber-400' : 'text-zinc-500'
                          }`}>{health.sprintVelocity}</span>
                        </div>

                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Blocked Tasks</span>
                          <span className={`text-xs font-bold ${health.blockedTasks > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{health.blockedTasks}</span>
                        </div>

                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Technical Debt</span>
                          <span className={`text-xs font-bold ${
                            health.technicalDebt === 'High' ? 'text-red-400' :
                            health.technicalDebt === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>{health.technicalDebt}</span>
                        </div>

                        <div className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/20 space-y-1">
                          <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase block">Confidence</span>
                          <span className="text-xs font-bold text-indigo-400 font-mono">{health.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-900/40 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Backlog</span>
                    <p className="text-2xl font-bold mt-1 text-white">{tasks.filter(t => t.status === 'backlog').length}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-900/40 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">In Progress</span>
                    <p className="text-2xl font-bold mt-1 text-white">{tasks.filter(t => t.status === 'in-progress').length}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-900/40 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Completed</span>
                    <p className="text-2xl font-bold mt-1 text-white">{tasks.filter(t => t.status === 'done').length}</p>
                  </div>
                </div>

                {/* Roadmaps Summary */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Milestones Timeline</h3>
                  {milestones.length === 0 ? (
                    <p className="text-zinc-500 text-xs">No roadmap milestones extracted. Try uploading a PRD file.</p>
                  ) : (
                    <div className="space-y-4">
                      {milestones.map((m) => (
                        <div key={m._id} className="flex justify-between items-start gap-4 p-3 rounded-lg border border-zinc-200/5 bg-zinc-950/20">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                            <p className="text-xs text-zinc-400 mt-0.5">{m.description}</p>
                          </div>
                          {m.targetDate && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{new Date(m.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Risk Analysis */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                      <span>AI Workspace Risk Audit</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">Compiled from PRD</span>
                  </div>

                  {reports.find(r => r.type === 'risk') ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-lg border border-red-500/10 bg-red-500/5 text-xs text-red-400">
                        <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Mitigations Overview</span>
                        <p className="mt-1.5 leading-relaxed text-zinc-300">
                          {reports.find(r => r.type === 'risk')?.summary || "Detailed risk items analyzed."}
                        </p>
                      </div>
                      
                      <div className="text-[11px] text-zinc-400 space-y-1.5 font-mono">
                        <p>✓ Flagged unclear requirement constraints.</p>
                        <p>✓ Checked integration dependencies & timeline scales.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-zinc-800 rounded-lg text-center text-xs text-zinc-500">
                      <span>No detailed risk audit compiled yet. Upload PRD specifications to trigger analyzer agents.</span>
                    </div>
                  )}
                </div>

                {/* AI Requirement Gap Analysis */}
                {(() => {
                  const gapReport = reports.find((r: any) => r.type === 'gap');
                  if (!gapReport) return null;
                  const gap = gapReport.details as any;
                  if (!gap || !gap.categories) return null;

                  const covered = gap.categories.filter((c: any) => c.covered);
                  const missing = gap.categories.filter((c: any) => !c.covered);

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                          <span>Requirement Gap Analysis</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">Coverage</span>
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            gap.coveragePercent >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
                            gap.coveragePercent >= 50 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{gap.coveragePercent}%</span>
                        </div>
                      </div>

                      {/* Coverage progress bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              gap.coveragePercent >= 75 ? 'bg-emerald-500' :
                              gap.coveragePercent >= 50 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${gap.coveragePercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                          <span>{gap.coveredCount} covered</span>
                          <span>{gap.missingCount} gaps detected</span>
                        </div>
                      </div>

                      {/* Missing Requirements */}
                      {missing.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            Missing Requirements ({missing.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {missing.map((cat: any) => (
                              <div key={cat.name} className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 space-y-1">
                                <span className="text-xs font-bold text-red-300">{cat.name}</span>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">{cat.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Covered Requirements */}
                      {covered.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Covered Requirements ({covered.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {covered.map((cat: any) => (
                              <div key={cat.name} className="p-2.5 rounded-lg border border-zinc-200/5 bg-zinc-950/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span className="text-xs text-zinc-300 font-semibold">{cat.name}</span>
                                </div>
                                <span className="text-[9px] text-emerald-500/70 font-mono font-bold">{cat.confidence}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* AI Architecture Recommendation */}
                {(() => {
                  const stackReport = reports.find((r: any) => r.type === 'stack');
                  if (!stackReport) return null;
                  const stack = stackReport.details as any;
                  if (!stack || !stack.recommendations) return null;

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <Cpu className="h-4.5 w-4.5 text-indigo-400" />
                          <span>Recommended Architecture & Stack</span>
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">AI Alignment</span>
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {stack.overallConfidence}% Match
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stack.recommendations.map((rec: any) => (
                          <div key={rec.category} className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/30 space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">{rec.label}</span>
                                <span className="text-[10px] text-indigo-400 font-mono font-semibold">{rec.confidence}% confidence</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-base">{rec.icon}</span>
                                <h4 className="text-sm font-bold text-white">{rec.recommended}</h4>
                              </div>
                              <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">{rec.reasoning}</p>
                            </div>
                            {rec.matchedKeywords && rec.matchedKeywords.length > 0 && (
                              <div className="pt-2 border-t border-zinc-800/40 flex flex-wrap gap-1 items-center">
                                <span className="text-[9px] text-zinc-500 font-mono">PRD Signals:</span>
                                {rec.matchedKeywords.slice(0, 3).map((kw: string) => (
                                  <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Daily AI Standup */}
                {(() => {
                  const standupReport = reports.find((r: any) => r.type === 'standup');
                  const standup = standupReport?.details || {
                    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
                    completedYesterday: tasks.filter(t => t.status === 'done').slice(0, 4).map(t => ({ id: t._id, title: t.title, storyPoints: t.storyPoints || 2 })),
                    plannedToday: tasks.filter(t => t.status === 'in-progress' || t.status === 'todo').slice(0, 4).map(t => ({ id: t._id, title: t.title, priority: t.priority, storyPoints: t.storyPoints || 2 })),
                    risksAndBlockers: tasks.filter(t => t.dependencies && t.dependencies.length > 0 && t.status !== 'done').slice(0, 3).map(t => ({ id: t._id, title: t.title, reason: 'Blocked by prerequisite tasks', severity: 'high' })),
                    suggestedFocus: {
                      title: tasks.find(t => t.status === 'in-progress')?.title || tasks[0]?.title || 'Sprint Progress',
                      reasoning: 'Highest priority active task in current engineering flow.'
                    }
                  };

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                      {/* Standup Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Daily AI Standup</h3>
                          <span className="text-[10px] text-zinc-400 font-mono">({standup.date || 'Today'})</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-semibold">
                          ⚡ Automated (Zero Prompt Required)
                        </span>
                      </div>

                      {/* Suggested Focus Highlight */}
                      {standup.suggestedFocus && (
                        <div className="p-3.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" />
                              Suggested Focus Today
                            </span>
                            <h4 className="text-sm font-bold text-white">{standup.suggestedFocus.title}</h4>
                            <p className="text-xs text-zinc-400">{standup.suggestedFocus.reasoning}</p>
                          </div>
                          <span className="shrink-0 px-3 py-1 rounded bg-indigo-600 text-white font-bold text-xs font-mono">
                            Priority Focus
                          </span>
                        </div>
                      )}

                      {/* 3 Standup Columns Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Yesterday / Completed */}
                        <div className="p-4 rounded-xl border border-zinc-200/5 bg-zinc-950/30 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Yesterday (Completed)
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{standup.completedYesterday?.length || 0} tasks</span>
                          </div>
                          {(!standup.completedYesterday || standup.completedYesterday.length === 0) ? (
                            <p className="text-xs text-zinc-500 italic py-2">No completed items yesterday.</p>
                          ) : (
                            <div className="space-y-2">
                              {standup.completedYesterday.map((item: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 text-xs flex justify-between items-center">
                                  <span className="text-zinc-300 font-medium truncate max-w-[80%]">{item.title}</span>
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">{item.storyPoints || 2} SP</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Today / Planned */}
                        <div className="p-4 rounded-xl border border-zinc-200/5 bg-zinc-950/30 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                            <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Today (Planned)
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{standup.plannedToday?.length || 0} tasks</span>
                          </div>
                          {(!standup.plannedToday || standup.plannedToday.length === 0) ? (
                            <p className="text-xs text-zinc-500 italic py-2">No active tasks scheduled for today.</p>
                          ) : (
                            <div className="space-y-2">
                              {standup.plannedToday.map((item: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 text-xs flex justify-between items-center">
                                  <span className="text-zinc-300 font-medium truncate max-w-[75%]">{item.title}</span>
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold shrink-0">
                                    {item.priority || 'medium'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Risks & Blocked */}
                        <div className="p-4 rounded-xl border border-zinc-200/5 bg-zinc-950/30 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                            <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                              Risks & Blocked
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{standup.risksAndBlockers?.length || 0} items</span>
                          </div>
                          {(!standup.risksAndBlockers || standup.risksAndBlockers.length === 0) ? (
                            <p className="text-xs text-emerald-400/80 italic py-2">✓ No blockers or risks flagged today.</p>
                          ) : (
                            <div className="space-y-2">
                              {standup.risksAndBlockers.map((item: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded bg-red-500/5 border border-red-500/10 text-xs space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-red-300 font-semibold truncate max-w-[80%]">{item.title}</span>
                                    <span className="text-[9px] font-mono uppercase px-1 rounded bg-red-500/20 text-red-400 font-bold shrink-0">
                                      {item.severity || 'high'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400">{item.reason}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* Agentic Automatic Reprioritization Visualizer */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/5 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Automatic Agentic Reprioritization</h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">Real-time priority adjustment cascade upon upstream failure events.</p>
                    </div>

                    <button
                      onClick={() => handleTriggerReprioritization('Payment API webhook failure detected on staging')}
                      disabled={reprioritizeLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-bold text-amber-300 font-mono transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Zap className={`h-3.5 w-3.5 ${reprioritizeLoading ? 'animate-spin' : ''}`} />
                      <span>{reprioritizeLoading ? 'Executing Cascade...' : 'Simulate Payment API Failure'}</span>
                    </button>
                  </div>

                  {/* Cascade Execution Steps */}
                  <div className="space-y-3">
                    {cascadeResult ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
                          ⚡ Cascade Executed: <strong>{cascadeResult.triggerEvent}</strong>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                          {cascadeResult.cascadeSteps?.map((step: any) => (
                            <div key={step.step} className="p-3 rounded-lg border border-zinc-200/5 bg-zinc-950/40 flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                {step.step}
                              </span>
                              <div className="space-y-0.5 min-w-0">
                                <h4 className="text-xs font-bold text-white font-mono">{step.title}</h4>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px] font-mono text-zinc-400">
                        <div className="p-2.5 rounded bg-zinc-950/30 border border-zinc-900">
                          <span className="text-amber-400 font-bold block">1. Payment API Fails</span>
                          <span className="text-[10px] text-zinc-500">Upstream Error</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-950/30 border border-zinc-900">
                          <span className="text-indigo-400 font-bold block">2. Move Notifications</span>
                          <span className="text-[10px] text-zinc-500">Shift Focus</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-950/30 border border-zinc-900">
                          <span className="text-purple-400 font-bold block">3. Delay Analytics</span>
                          <span className="text-[10px] text-zinc-500">Buffer Schedule</span>
                        </div>
                        <div className="p-2.5 rounded bg-zinc-950/30 border border-zinc-900">
                          <span className="text-emerald-400 font-bold block">4. Boost & Notify</span>
                          <span className="text-[10px] text-zinc-500">Alert Team</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Decision Log */}
                {(() => {
                  const displayLogs = decisionLogs.length > 0 ? decisionLogs : [
                    {
                      _id: '1',
                      title: 'Authentication Prioritized',
                      category: 'prioritization',
                      reason: 'Payment integration and user role profiles depend directly on core authentication.',
                      confidence: 94,
                      impact: 'high',
                      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                    },
                    {
                      _id: '2',
                      title: 'Timeline & Delivery Buffer Adjusted',
                      category: 'timeline',
                      reason: 'Stripe API integration delayed due to missing webhook credentials; added 5-day contingency.',
                      confidence: 88,
                      impact: 'medium',
                      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                    }
                  ];

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                      <div className="flex justify-between items-center border-b border-zinc-200/5 pb-4">
                        <div className="flex items-center gap-2">
                          <History className="h-4.5 w-4.5 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Transparent AI Decision Log</h3>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">Auditable Reasoning History</span>
                      </div>

                      <div className="space-y-4">
                        {displayLogs.map((log: any) => {
                          const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          return (
                            <div key={log._id || log.title} className="p-4 rounded-xl border border-zinc-200/5 bg-zinc-950/40 space-y-3 hover:border-zinc-800 transition-all">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 font-mono">
                                    {dateStr}
                                  </span>
                                  <h4 className="text-sm font-bold text-white">{log.title}</h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 font-bold">
                                    {log.confidence}% Confidence
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                    log.impact === 'high' || log.impact === 'critical' 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}>
                                    {log.category}
                                  </span>
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/50 space-y-1 text-xs">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono block">AI Reasoning</span>
                                <p className="text-zinc-300 leading-relaxed font-sans">{log.reason}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Release Readiness Score */}
                {(() => {
                  const readinessData = releaseReadiness || {
                    score: 82,
                    status: 'Ready with Warnings',
                    checklist: [
                      { id: '1', key: 'unit_tests', label: 'Unit Tests', completed: false, description: 'Automated test suite coverage' },
                      { id: '2', key: 'documentation', label: 'Documentation', completed: false, description: 'API & user guide docs' },
                      { id: '3', key: 'error_monitoring', label: 'Error Monitoring', completed: false, description: 'Sentry or logging setup' },
                      { id: '4', key: 'cicd', label: 'CI/CD Pipeline', completed: false, description: 'Automated build & deploy workflow' },
                    ]
                  };

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                      <div className="flex justify-between items-center border-b border-zinc-200/5 pb-4">
                        <div className="flex items-center gap-2">
                          <Rocket className="h-4.5 w-4.5 text-indigo-400" />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Release Readiness Score</h3>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          readinessData.score >= 80 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                          readinessData.score >= 60 ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' :
                          'border-red-500/20 bg-red-500/10 text-red-400'
                        }`}>
                          {readinessData.status || (readinessData.score >= 80 ? 'Release Ready' : 'Needs Review')}
                        </span>
                      </div>

                      {/* Visual score gauge */}
                      <div className="flex items-center gap-6 p-4 rounded-xl bg-zinc-950/40 border border-zinc-200/5">
                        <div className="relative flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              className="stroke-zinc-800"
                              strokeWidth="5"
                              fill="transparent"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              className={`transition-all duration-1000 ${
                                readinessData.score >= 80 ? 'stroke-emerald-500' :
                                readinessData.score >= 60 ? 'stroke-amber-500' : 'stroke-red-500'
                              }`}
                              strokeWidth="5"
                              fill="transparent"
                              strokeDasharray={(2 * Math.PI * 26).toString()}
                              strokeDashoffset={(2 * Math.PI * 26 * (1 - readinessData.score / 100)).toString()}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-base font-extrabold text-white font-mono">{readinessData.score}%</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Deployment Checklist</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Track production readiness requirements before final release.</p>
                        </div>
                      </div>

                      {/* Checklist items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {readinessData.checklist.map((item: any) => (
                          <div
                            key={item.id || item.key}
                            className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                              item.completed
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                                : 'bg-zinc-950/30 border-zinc-200/5 text-zinc-400'
                            }`}
                          >
                            {item.completed ? (
                              <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-zinc-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className={`text-xs font-bold font-mono block ${item.completed ? 'text-emerald-300' : 'text-zinc-300'}`}>
                                {item.label}
                              </span>
                              <span className="text-[10px] text-zinc-500 block truncate">{item.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Project Activity Log */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Project Operational Activity</span>
                  </h3>

                  <div className="space-y-4 text-xs">
                    {[
                      { event: "Agent graph analysis run", detail: "Risk logs and milestone roadmap updated.", time: "2 hours ago" },
                      { event: "Backlog populated", detail: `${tasks.length} issues registered dynamically from PRD.`, time: "Yesterday" },
                      { event: "Workspace initialized", detail: `Project ${project.name} successfully deployed.`, time: "2 days ago" }
                    ].map((act, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-semibold text-white">{act.event}</p>
                          <p className="text-[11px] text-zinc-550 mt-0.5">{act.detail}</p>
                        </div>
                        <span className="text-[10px] text-zinc-650 font-mono shrink-0">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Recommendations Panel */}
              <div className="space-y-6">
                
                {/* Long-Term Memory Widget */}
                {userMemory && (
                  <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-950/20 glass-panel space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-purple-500/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4.5 w-4.5 text-purple-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Long-Term Memory</h3>
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        Cross-Project Preference
                      </span>
                    </div>

                    <p className="text-xs text-purple-200/80 leading-relaxed font-sans">
                      Last month in <strong>{userMemory.projectHistory?.[0]?.projectName || 'E-Commerce Core'}</strong>, you preferred:
                    </p>

                    {/* Preferences list with Reuse buttons */}
                    <div className="space-y-2">
                      {userMemory.preferences?.map((pref: any) => {
                        const isReused = memoryReused[pref.category];
                        return (
                          <div key={pref.category} className="p-2.5 rounded-lg border border-purple-500/10 bg-zinc-950/40 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 font-mono uppercase block">{pref.category}</span>
                              <span className="text-xs font-bold text-white font-mono">{pref.value}</span>
                            </div>
                            <button
                              onClick={() => {
                                setMemoryReused(prev => ({ ...prev, [pref.category]: true }));
                              }}
                              disabled={isReused}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                isReused
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40'
                              }`}
                            >
                              {isReused ? '✓ Reused' : 'Reuse in Project'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4 flex flex-col justify-between min-h-[350px]">

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                      <span>AI Engineering Manager Analysis</span>
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Personalized backlog, velocity updates, and tech stack adjustments calculated automatically.
                    </p>
                  </div>

                  {recsLoading ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
                      <span>Calculating sprint variables...</span>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto text-xs text-zinc-300 leading-relaxed border-t border-zinc-200/5 pt-3">
                      <div className="whitespace-pre-line">
                        {recommendation || "No recommendations generated yet. Refresh details to load."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Project Workspaces */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Folder className="h-4.5 w-4.5 text-sky-400" />
                      <span>Related Workspaces</span>
                    </h3>
                    <p className="text-xs text-zinc-500">Hop directly to other active project hubs.</p>
                  </div>

                  {allProjects.filter(p => p._id !== projectId).length === 0 ? (
                    <div className="p-3 border border-zinc-800 rounded-lg text-center text-xs text-zinc-650 font-mono">
                      No other projects found.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {allProjects
                        .filter(p => p._id !== projectId)
                        .slice(0, 3)
                        .map((p) => (
                          <Link 
                            key={p._id}
                            href={`/projects/${p._id}`}
                            className="block p-3 rounded-lg border border-zinc-200/5 bg-zinc-950/40 hover:border-indigo-500/20 transition-all text-xs"
                          >
                            <div className="flex justify-between items-center font-bold text-white truncate">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] text-zinc-500 uppercase font-mono font-normal">
                                {p.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-550 truncate mt-1">{p.description || "Agile project space."}</p>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: KANBAN BOARD */}
          {activeTab === 'kanban' && (
            <div className="space-y-4">
              
              {/* Kanban controls */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Drag or update status directly by shifting task cards.</span>
                <button 
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-200/10 hover:bg-zinc-800 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Task Form Drawer */}
              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-950/60 max-w-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Task Title *</label>
                      <input 
                        type="text" 
                        required
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g. Implement user login routes"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Description</label>
                      <textarea 
                        rows={2}
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        placeholder="Task context..."
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Priority</label>
                      <select 
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Story Points</label>
                      <input 
                        type="number" 
                        value={taskSP}
                        onChange={(e) => setTaskSP(parseInt(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setShowTaskForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200/10 hover:bg-zinc-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white cursor-pointer"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              {/* Kanban Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {columns.map((col) => {
                  const colTasks = tasks.filter(t => t.status === col.status);
                  return (
                    <div 
                      key={col.status} 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.status)}
                      className="flex flex-col h-[550px] border border-zinc-200/10 bg-zinc-950/20 rounded-xl overflow-hidden"
                    >
                      <div className="p-3 bg-zinc-950/80 border-b border-zinc-200/10 flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                        <span>{col.label}</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                          {colTasks.length}
                        </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {colTasks.map((task) => {
                          const priorityColors = {
                            low: 'border-zinc-700 bg-zinc-850 text-zinc-400',
                            medium: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
                            high: 'border-orange-500/25 bg-orange-500/5 text-orange-400',
                            urgent: 'border-red-500/25 bg-red-500/5 text-red-400'
                          };
                          const badgeClass = priorityColors[task.priority] || priorityColors.medium;
                          
                          return (
                            <div 
                              key={task._id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, task._id)}
                              className="p-3.5 rounded-lg border border-zinc-200/10 bg-zinc-900 hover:border-zinc-750 transition-all text-xs space-y-3 cursor-grab active:cursor-grabbing hover:shadow-md"
                            >
                              {/* Header row: Priority and Smart Assign */}
                              <div className="flex justify-between items-center">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${badgeClass}`}>
                                  {task.priority}
                                </span>
                                
                                <button
                                  onClick={() => handleSmartAssign(task)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-[9px] font-mono font-bold text-indigo-300 transition-all cursor-pointer"
                                  title="AI Recommended Member Assignment"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  <span>Smart Assign</span>
                                </button>
                              </div>

                              {/* Title and Description */}
                              <div className="space-y-1">
                                <h4 className="font-semibold text-white leading-normal line-clamp-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{task.description}</p>
                                )}
                              </div>

                              {/* Labels List */}
                              {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {task.labels.map((l, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[9px] font-semibold text-zinc-400">
                                      {l}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Footer details: SP and navigation */}
                              <div className="flex justify-between items-center pt-2.5 border-t border-zinc-200/5 text-[10px] text-zinc-500">
                                <span className="font-bold text-indigo-400 font-mono">{task.storyPoints} SP</span>
                                
                                {/* Quick Move Trigger buttons */}
                                <div className="flex gap-1.5">
                                  {col.status !== 'backlog' && (
                                    <button 
                                      onClick={() => handleMoveTask(task._id, columns[columns.findIndex(c => c.status === col.status) - 1].status)}
                                      className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:text-white cursor-pointer"
                                      title="Move back"
                                    >
                                      &larr;
                                    </button>
                                  )}
                                  {col.status !== 'done' && (
                                    <button 
                                      onClick={() => handleMoveTask(task._id, columns[columns.findIndex(c => c.status === col.status) + 1].status)}
                                      className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:text-white cursor-pointer"
                                      title="Move forward"
                                    >
                                      &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: DEPENDENCY GRAPH */}
          {activeTab === 'dependencies' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Graph visualizer */}
              <div 
                ref={containerRef} 
                className="lg:col-span-3 border border-zinc-200/10 rounded-xl bg-zinc-900/20 p-6 relative overflow-x-auto min-h-[550px]"
              >
                {/* Info Tip Header */}
                <div className="absolute top-4 left-4 z-30 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <span>ℹ Click any task node to highlight blocker chains and estimated delivery impact.</span>
                </div>

                {/* SVG Connections overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    <marker id="arrow-zinc" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#3f3f46" />
                    </marker>
                    <marker id="arrow-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
                    </marker>
                    <marker id="arrow-indigo" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#818cf8" />
                    </marker>
                  </defs>

                  {connections.map((c) => {
                    const isSelectedPathBlocker = selectedTaskId && 
                      (selectedBlockers.has(c.toId) || selectedTaskId === c.toId) &&
                      (selectedBlockers.has(c.fromId) || selectedTaskId === c.fromId);
                      
                    const isSelectedPathDownstream = selectedTaskId &&
                      (selectedDownstream.has(c.fromId) || selectedTaskId === c.fromId) &&
                      (selectedDownstream.has(c.toId) || selectedTaskId === c.toId);

                    let strokeColor = '#27272a';
                    let strokeWidth = 1.5;
                    let markerEnd = 'url(#arrow-zinc)';
                    let isDimmedPath = selectedTaskId && !isSelectedPathBlocker && !isSelectedPathDownstream;

                    if (isSelectedPathBlocker) {
                      strokeColor = '#f59e0b';
                      strokeWidth = 2;
                      markerEnd = 'url(#arrow-amber)';
                    } else if (isSelectedPathDownstream) {
                      strokeColor = '#818cf8';
                      strokeWidth = 2;
                      markerEnd = 'url(#arrow-indigo)';
                    }

                    // Calculate Bezier curve control points
                    const controlX = (c.fromX + c.toX) / 2;
                    const pathD = `M ${c.fromX} ${c.fromY} C ${controlX} ${c.fromY}, ${controlX} ${c.toY}, ${c.toX - 8} ${c.toY}`;

                    return (
                      <path
                        key={c.id}
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        markerEnd={markerEnd}
                        className={`transition-all duration-300 ${isDimmedPath ? 'opacity-10' : 'opacity-100'}`}
                      />
                    );
                  })}
                </svg>

                {/* Grid Columns for Layout tiers */}
                {(() => {
                  const taskTiers = getTaskTiers(tasks);
                  const maxTier = Math.max(-1, ...Object.values(taskTiers));
                  const columnsCount = maxTier + 1;
                  
                  const columnsList: Task[][] = Array.from({ length: columnsCount }, () => []);
                  tasks.forEach(t => {
                    const tier = taskTiers[t._id] || 0;
                    columnsList[tier].push(t);
                  });

                  if (tasks.length === 0) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px] text-zinc-500 text-xs">
                        No active tasks detected to generate graph.
                      </div>
                    );
                  }

                  return (
                    <div className="flex gap-16 min-w-max relative z-20 pt-8">
                      {columnsList.map((colTasks, colIdx) => (
                        <div key={colIdx} className="w-64 flex flex-col gap-6">
                          <div className="p-2 border-b border-zinc-200/10 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono text-center">
                            Tier {colIdx + 1}
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-6 justify-center">
                            {colTasks.map((task) => {
                              const isSelected = selectedTaskId === task._id;
                              const isBlocker = selectedBlockers.has(task._id);
                              const isDownstream = selectedDownstream.has(task._id);
                              const isDimmed = selectedTaskId && !isSelected && !isBlocker && !isDownstream;

                              return (
                                <div 
                                  key={task._id}
                                  ref={el => { nodeRefs.current[task._id] = el; }}
                                  onClick={() => setSelectedTaskId(selectedTaskId === task._id ? null : task._id)}
                                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none space-y-3 relative ${
                                    isSelected 
                                      ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10 shadow-lg scale-[1.02]' 
                                      : isBlocker
                                      ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
                                      : isDownstream
                                      ? 'border-purple-500/40 bg-purple-500/5 hover:border-purple-500/60'
                                      : 'border-zinc-200/10 bg-zinc-900/50 hover:border-zinc-200/20'
                                  } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                                >
                                  <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      task.status === 'done'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : task.status === 'in-progress'
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}>
                                      {task.status}
                                    </span>
                                    <span className="text-zinc-500 font-bold">{task.storyPoints} SP</span>
                                  </div>

                                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{task.title}</h4>

                                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200/5 text-[9px] font-mono">
                                    <span className={`uppercase font-bold ${
                                      task.priority === 'urgent' ? 'text-red-400' :
                                      task.priority === 'high' ? 'text-orange-400' :
                                      task.priority === 'medium' ? 'text-amber-400' : 'text-zinc-500'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    {task.dependencies && task.dependencies.length > 0 && (
                                      <span className="text-zinc-500 flex items-center gap-0.5" title={`${task.dependencies.length} prerequisite blocker tasks`}>
                                        <GitMerge className="h-3 w-3 shrink-0" />
                                        <span>{task.dependencies.length}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Right Side Panel: Dependency Analysis Audit */}
              <div className="lg:col-span-1">
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-5">
                  {selectedTaskId ? (
                    (() => {
                      const selectedTask = tasks.find(t => t._id === selectedTaskId);
                      if (!selectedTask) return null;

                      const blockersCount = selectedBlockers.size;
                      const downstreamCount = selectedDownstream.size;
                      
                      const affectedSP = tasks
                        .filter(t => t._id === selectedTaskId || selectedDownstream.has(t._id))
                        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

                      return (
                        <div className="space-y-5">
                          <div>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Dependency Impact Audit</span>
                            <h3 className="text-base font-bold text-white mt-1">{selectedTask.title}</h3>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedTask.description || "No description provided."}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-200/5 py-4 text-xs font-mono">
                            <div>
                              <span className="text-zinc-500 block">Status</span>
                              <span className="text-white font-bold">{selectedTask.status.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">Priority</span>
                              <span className="text-white font-bold">{selectedTask.priority.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">Story Points</span>
                              <span className="text-indigo-400 font-bold">{selectedTask.storyPoints} SP</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block">Impact Risk</span>
                              <span className="text-purple-400 font-bold">{affectedSP} SP at risk</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Blocker Path List */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Prerequisites / Blockers ({blockersCount})</span>
                              </h4>
                              {blockersCount === 0 ? (
                                <p className="text-[11px] text-zinc-500">No prerequisites. Ready to start immediately.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                  {tasks.filter(t => selectedBlockers.has(t._id)).map(t => (
                                    <div key={t._id} className="p-2 rounded bg-zinc-950/40 border border-zinc-800 text-[11px] flex justify-between items-center">
                                      <span className="text-zinc-300 truncate max-w-[70%]">{t.title}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        t.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                      }`}>{t.status}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Downstream Path List */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                <span>Downstream Tasks Affected ({downstreamCount})</span>
                              </h4>
                              {downstreamCount === 0 ? (
                                <p className="text-[11px] text-zinc-500">No downstream items rely on this task.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                  {tasks.filter(t => selectedDownstream.has(t._id)).map(t => (
                                    <div key={t._id} className="p-2 rounded bg-zinc-950/40 border border-zinc-800 text-[11px] flex justify-between items-center">
                                      <span className="text-zinc-300 truncate max-w-[75%]">{t.title}</span>
                                      <span className="text-zinc-500 font-bold">{t.storyPoints} SP</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Impact assessment box */}
                          <div className="p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 space-y-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Estimated Delivery Impact</span>
                            <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                              {selectedTask.status === 'done' ? (
                                "✓ Task completed. Downstream flow is fully unblocked."
                              ) : downstreamCount > 0 ? (
                                `⚠️ Delaying this task will chain-block ${downstreamCount} downstream task${downstreamCount > 1 ? 's' : ''}, delaying milestone targets and threatening ${affectedSP} total Story Points.`
                              ) : (
                                "Low direct chain risk. No downstream tasks are currently waiting on this item."
                              )}
                            </p>
                          </div>

                          {/* Delay Simulator */}
                          {selectedTask.status !== 'done' && (
                            <div className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-950/40 space-y-4 pt-4 border-t border-zinc-200/5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono font-semibold">AI Timeline Simulator</span>
                                <span className="text-[9px] text-zinc-500 font-mono">What-If Analysis</span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-400">
                                  <span>Simulated Delay:</span>
                                  <span className="font-bold text-white font-mono">{delayDays} Days</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="30"
                                  value={delayDays}
                                  onChange={(e) => setDelayDays(parseInt(e.target.value))}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                              </div>

                              {/* Dynamic Simulation Chain */}
                              {(() => {
                                const compoundingBuffer = Math.round(delayDays * 0.4);
                                const releaseDelay = delayDays + compoundingBuffer;
                                
                                const taskSprint = sprints.find(s => s._id === selectedTask.sprintId);
                                const sprintName = taskSprint ? taskSprint.name : "Active Sprint";

                                const taskMilestone = milestones.find(m => m._id === selectedTask.milestoneId);
                                const milestoneName = taskMilestone ? taskMilestone.title : "MVP Deployment";

                                const baseRisk = project.riskScore || 25;
                                const newRisk = Math.min(95, Math.round(baseRisk + (delayDays * 2.2) + (downstreamCount * 2.8)));

                                return (
                                  <div className="space-y-3.5 pt-2 border-t border-zinc-200/5 text-xs">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                      <p className="truncate">
                                        <span className="font-semibold text-white">{selectedTask.title}</span> delayed {delayDays} days
                                      </p>
                                    </div>
                                    
                                    <div className="pl-0.5 text-zinc-600 font-mono text-[10px]">&darr;</div>

                                    <div className="flex items-center gap-2 text-zinc-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                      <p className="truncate">
                                        <span className="font-semibold text-white">{sprintName}</span> delayed by {delayDays} days
                                      </p>
                                    </div>

                                    <div className="pl-0.5 text-zinc-600 font-mono text-[10px]">&darr;</div>

                                    <div className="flex items-center gap-2 text-zinc-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                      <p className="truncate">
                                        <span className="font-semibold text-white">{milestoneName}</span> target moved
                                      </p>
                                    </div>

                                    <div className="pl-0.5 text-zinc-600 font-mono text-[10px]">&darr;</div>

                                    <div className="flex items-center gap-2 text-zinc-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                      <p>
                                        Release delayed by <span className="font-bold text-orange-400 font-mono">{releaseDelay} days</span>
                                      </p>
                                    </div>

                                    <div className="pl-0.5 text-zinc-600 font-mono text-[10px]">&darr;</div>

                                    <div className="p-2.5 rounded bg-red-500/5 border border-red-500/10 flex justify-between items-center font-mono text-[11px]">
                                      <span className="text-zinc-400">Timeline Delivery Risk:</span>
                                      <span className="text-red-400 font-bold">{newRisk}%</span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center h-[350px] space-y-3">
                      <GitMerge className="h-8 w-8 text-zinc-650 stroke-1" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Estimated Impact Audit</h4>
                        <p className="text-xs text-zinc-500 max-w-[180px] mt-1 leading-normal">Select a task node to trace blockers, downstream impacts, and affected story points.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="border border-zinc-200/10 rounded-xl bg-zinc-900/40 p-6 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/5 pb-6">
                <div>
                  <h3 className="text-base font-bold text-white font-mono">Project Deliverables Roadmap</h3>
                  <p className="text-xs text-zinc-500">Milestones timeline, sequential dependencies, and progress status tracking.</p>
                </div>
                
                {/* Overall Progress Tracker */}
                <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-200/10 p-3 rounded-lg text-xs">
                  <div>
                    <div className="flex justify-between items-center font-bold text-zinc-400 mb-1">
                      <span>Overall Progress</span>
                      <span className="text-indigo-400 font-mono">
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-32 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-500" 
                        style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center p-8 text-zinc-500 text-sm">
                  No milestones available. Go to add project page and upload your PRD.
                </div>
              ) : (
                <div className="relative border-l border-zinc-850 ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
                  {milestones.map((m, idx) => {
                    // Calculate milestone progress
                    const milestoneTasks = tasks.filter(t => t.milestoneId === m._id || (!t.milestoneId && idx === 0));
                    const totalTasks = milestoneTasks.length;
                    const completedTasks = milestoneTasks.filter(t => t.status === 'done').length;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (idx === 0 ? 100 : 0);

                    // Formulate dependency mapping
                    const dependencyText = idx > 0 && milestones[idx - 1]
                      ? `Depends on Phase ${idx}: ${milestones[idx - 1].title}`
                      : "No pre-requisite dependencies";

                    return (
                      <div key={m._id} className="relative group">
                        {/* Bullet Icon */}
                        <div className={`absolute -left-[45px] md:-left-[61px] top-1.5 h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all shadow-md ${
                          progress === 100 
                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                            : progress > 0 
                            ? 'bg-indigo-650 text-white border-indigo-500 font-bold animate-pulse'
                            : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                        }`}>
                          {progress === 100 ? "✓" : idx + 1}
                        </div>

                        <div className="p-5 border border-zinc-200/5 bg-zinc-950/20 hover:bg-zinc-950/40 rounded-xl space-y-4 transition-all">
                          
                          {/* Top row */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Phase {idx + 1}</span>
                              <h4 className="text-base font-bold text-white mt-0.5">{m.title}</h4>
                            </div>
                            
                            {/* Date Badge */}
                            {m.targetDate && (
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-semibold uppercase font-mono">
                                <Clock className="h-3.5 w-3.5 text-zinc-650" />
                                <span>Target: {new Date(m.targetDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed">{m.description}</p>

                          {/* Progress Tracker Slider bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold font-mono">
                              <span>Milestone Tasks Completion</span>
                              <span className={progress === 100 ? "text-emerald-400" : progress > 0 ? "text-indigo-400" : "text-zinc-550"}>
                                {completedTasks} / {totalTasks} Tasks ({progress}%)
                              </span>
                            </div>
                            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Dependency Details footer */}
                          <div className="pt-3 border-t border-zinc-200/5 flex flex-wrap justify-between items-center gap-2 text-[10px] font-semibold text-zinc-500">
                            <div className="flex items-center gap-1 font-mono">
                              <Layers className="h-3.5 w-3.5 text-zinc-700" />
                              <span>{dependencyText}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-bold font-mono ${
                              progress === 100
                                ? 'border border-emerald-500/25 bg-emerald-500/5 text-emerald-400'
                                : progress > 0
                                ? 'border border-indigo-500/25 bg-indigo-500/5 text-indigo-400'
                                : 'border border-zinc-700 bg-zinc-850 text-zinc-500'
                            }`}>
                              {progress === 100 ? 'Done' : progress > 0 ? 'Active' : 'Pending'}
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SPRINTS */}
          {activeTab === 'sprints' && (
            <div className="space-y-8">
              
              {/* Sprint Analytics & Burndown Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Sprint Burndown Chart with Prediction */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <BurndownIcon className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                        <span>Sprint Burndown & Velocity Prediction</span>
                      </h3>
                      <p className="text-xs text-zinc-500">Ideal vs Actual vs Predicted velocity completion trajectory.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 font-bold">
                        Velocity: {burndownPrediction?.currentVelocity || 18} SP/week
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold uppercase ${
                        burndownPrediction?.daysLate > 0 
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-300' 
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {burndownPrediction?.status || 'Sprint finishes 4 days late'}
                      </div>
                    </div>
                  </div>

                  <div className="h-[260px] w-full pt-4 font-mono text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={burndownPrediction?.burndownData || [
                          { day: 'Day 1', ideal: 32, actual: 32, predicted: 32 },
                          { day: 'Day 2', ideal: 28.8, actual: 32, predicted: 32 },
                          { day: 'Day 3', ideal: 25.6, actual: 29, predicted: 29 },
                          { day: 'Day 4', ideal: 22.4, actual: 25, predicted: 25 },
                          { day: 'Day 5', ideal: 19.2, actual: 25, predicted: 25 },
                          { day: 'Day 6', ideal: 16, actual: 21, predicted: 21 },
                          { day: 'Day 7', ideal: 12.8, actual: 16, predicted: 16 },
                          { day: 'Day 8', ideal: 9.6, actual: 12, predicted: 12 },
                          { day: 'Day 9', ideal: 6.4, actual: 8, predicted: 8 },
                          { day: 'Day 10', ideal: 3.2, actual: 6, predicted: 6 },
                          { day: 'Day 11', ideal: 0, actual: null, predicted: 4 },
                          { day: 'Day 12', ideal: 0, actual: null, predicted: 2 },
                          { day: 'Day 13', ideal: 0, actual: null, predicted: 0 }
                        ]}
                        margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="day" stroke="#71717a" />
                        <YAxis stroke="#71717a" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="ideal" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} name="Ideal Burndown" />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual Burndown" />
                        <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} name="Predicted Trajectory" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sprints list summary */}
                <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <CalendarRange className="h-4.5 w-4.5 text-indigo-400" />
                        <span>Active Sprints</span>
                      </h3>
                      <p className="text-xs text-zinc-500">Current sprint cycle details.</p>
                    </div>

                    {sprints.length === 0 ? (
                      <div className="space-y-3 text-xs text-zinc-400">
                        <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg">
                          <span className="font-bold text-white">Sprint 1 (Active)</span>
                          <p className="text-[11px] text-zinc-500 mt-1">Goal: Project Foundation & API middle setup.</p>
                          <div className="flex justify-between items-center mt-3 text-[10px] text-zinc-500">
                            <span>Points: 0 / 32 SP</span>
                            <span>Ends: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                        {sprints.map((s, idx) => (
                          <div key={s._id || idx} className="p-3 bg-zinc-950/40 border border-zinc-200/5 rounded-lg text-xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{s.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                                s.status === 'active' 
                                  ? 'border border-indigo-500/25 bg-indigo-500/5 text-indigo-400'
                                  : s.status === 'completed'
                                  ? 'border border-emerald-500/25 bg-emerald-500/5 text-emerald-400'
                                  : 'border border-zinc-800 text-zinc-500 bg-zinc-900/40'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                            {s.goal && <p className="text-[11px] text-zinc-500">{s.goal}</p>}
                            <div className="flex justify-between items-center text-[10px] text-zinc-550 pt-1.5 font-mono">
                              <span>Points: {s.completedPoints} / {s.totalPoints} SP</span>
                              <span>Ends: {new Date(s.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleGenerateSprintReport}
                    disabled={reportLoading}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ReportIcon className="h-4 w-4" />
                    <span>{reportLoading ? "Generating report..." : "Generate AI Sprint Report"}</span>
                  </button>
                </div>

              </div>

              {/* Sprint Planning Reports Content display */}
              {(reportLoading || sprintReportText) && (
                <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span>AI Scrum Master Sprint Report</span>
                    </h3>
                  </div>

                  {reportLoading ? (
                    <div className="py-12 flex items-center justify-center text-zinc-500 text-xs">
                      <span>AI Scrum Master is compiling task history, velocity logs, and retrospective summaries...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[350px] p-4 bg-black/40 border border-zinc-800 rounded-lg">
                      {sprintReportText}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-8">
              
              {/* Executive Multi-Audience Reports Section */}
              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/5 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                      <span>Multi-Audience Executive Reports</span>
                    </h3>
                    <p className="text-xs text-zinc-400">One project workspace → four completely tailored executive views.</p>
                  </div>
                  
                  {/* Persona Selector Tabs */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/60 border border-zinc-200/10 rounded-xl">
                    {[
                      { id: 'ceo', label: 'CEO', icon: Briefcase },
                      { id: 'pm', label: 'Product Manager', icon: Target },
                      { id: 'developer', label: 'Developers', icon: Code2 },
                      { id: 'investor', label: 'Investors', icon: DollarSign }
                    ].map(persona => {
                      const Icon = persona.icon;
                      const isSelected = selectedAudience === persona.id;
                      return (
                        <button
                          key={persona.id}
                          onClick={() => setSelectedAudience(persona.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md font-bold'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{persona.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Render Persona Audience Report Card */}
                {(() => {
                  const totalSP = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
                  const completedSP = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
                  const spPercent = totalSP > 0 ? Math.round((completedSP / totalSP) * 100) : 0;
                  const blockedTasksCount = tasks.filter(t => t.status !== 'done' && t.dependencies && t.dependencies.length > 0).length;

                  // Dynamic persona configuration
                  const personaConfigs: Record<string, any> = {
                    ceo: {
                      title: 'CEO One-Page Executive Brief',
                      subtitle: `High-level strategic status audit for ${project?.name || 'Workspace'}`,
                      summary: `Project "${project?.name || 'Workspace'}" is operating at ${health?.score || 87}/100 Health score with ${health?.confidence || 89}% delivery confidence. Overall project completion is at ${spPercent}% of target scope with ${blockedTasksCount} critical bottlenecks flagged for resolution.`,
                      metrics: [
                        { label: 'Overall Progress', val: `${spPercent}%`, color: 'text-emerald-400' },
                        { label: 'Health Score', val: `${health?.score || 87}/100`, color: 'text-emerald-400' },
                        { label: 'Delivery Risk', val: health?.timelineRisk || 'Low', color: 'text-emerald-400' },
                        { label: 'Strategic Alignment', val: 'High', color: 'text-indigo-400' }
                      ],
                      sections: [
                        { title: 'Key Accomplishments & Milestones', items: [`Completed ${tasks.filter(t => t.status === 'done').length} core deliverables (${completedSP} SP delivered).`, `Milestones active: ${milestones.length || 1} phases registered.`] },
                        { title: 'Executive Strategic Focus', items: ['Maintain velocity to hit target delivery date.', 'Clear prerequisite task bottlenecks on critical path.'] }
                      ]
                    },
                    pm: {
                      title: 'Product Manager Feature & Roadmap Audit',
                      subtitle: `Feature delivery, scope completeness, and milestone tracking for ${project?.name || 'Workspace'}`,
                      summary: `Scope completion stands at ${spPercent}% (${completedSP}/${totalSP} Story Points). Requirement completeness is rated at ${health?.requirementCompleteness || 92}%. Active milestones are progressing according to schedule with stable sprint velocity.`,
                      metrics: [
                        { label: 'Scope Completed', val: `${completedSP} / ${totalSP} SP`, color: 'text-indigo-400' },
                        { label: 'Requirements Coverage', val: `${health?.requirementCompleteness || 92}%`, color: 'text-emerald-400' },
                        { label: 'Sprint Velocity', val: health?.sprintVelocity || 'Stable', color: 'text-emerald-400' },
                        { label: 'Pending Features', val: `${tasks.filter(t => t.status !== 'done').length} Items`, color: 'text-amber-400' }
                      ],
                      sections: [
                        { title: 'Milestone Timeline Breakdown', items: milestones.length > 0 ? milestones.map(m => `Phase: ${m.title} — ${m.description || 'In Progress'}`) : ['Phase 1: Foundation & Core Logic (Active)'] },
                        { title: 'Feature Scope & Requirement Health', items: [`Total issues: ${tasks.length} (${tasks.filter(t => t.status === 'done').length} Done, ${tasks.filter(t => t.status === 'in-progress').length} In Progress).`, `Blocked tasks: ${blockedTasksCount} task(s) awaiting dependency resolution.`] }
                      ]
                    },
                    developer: {
                      title: 'Engineering & Developer Worklog Brief',
                      subtitle: `Technical blockers, PR readiness, and task prioritization for ${project?.name || 'Workspace'}`,
                      summary: `Development backlog contains ${tasks.filter(t => t.status !== 'done').length} active items. ${blockedTasksCount} tasks require prerequisite dependency resolution. Technical debt score is rated as ${health?.technicalDebt || 'Medium'}.`,
                      metrics: [
                        { label: 'In Progress Tasks', val: `${tasks.filter(t => t.status === 'in-progress').length} Active`, color: 'text-indigo-400' },
                        { label: 'Blocked Bottlenecks', val: `${blockedTasksCount} Tasks`, color: blockedTasksCount > 0 ? 'text-amber-400' : 'text-emerald-400' },
                        { label: 'Technical Debt', val: health?.technicalDebt || 'Medium', color: 'text-amber-400' },
                        { label: 'Story Points Pending', val: `${totalSP - completedSP} SP`, color: 'text-indigo-400' }
                      ],
                      sections: [
                        { title: 'Critical Technical Blockers & Dependencies', items: tasks.filter(t => t.dependencies && t.dependencies.length > 0 && t.status !== 'done').length > 0 ? tasks.filter(t => t.dependencies && t.dependencies.length > 0 && t.status !== 'done').map(t => `Task "${t.title}" is blocked by prerequisite tasks.`) : ['No critical technical blockers detected in active engineering flow.'] },
                        { title: 'Developer Priority Queue', items: tasks.filter(t => t.status === 'in-progress' || t.priority === 'high' || t.priority === 'urgent').slice(0, 4).map(t => `[${t.priority.toUpperCase()}] ${t.title} (${t.storyPoints || 2} SP)`) }
                      ]
                    },
                    investor: {
                      title: 'Investor & Stakeholder Delivery Report',
                      subtitle: `Velocity, milestone progress, and capital ROI metrics for ${project?.name || 'Workspace'}`,
                      summary: `Project "${project?.name || 'Workspace'}" exhibits a high delivery confidence rate of ${health?.confidence || 89}% with an overall Health score of ${health?.score || 87}/100. Product velocity is ${health?.sprintVelocity || 'Stable'}, with ${spPercent}% of promised target milestones completed.`,
                      metrics: [
                        { label: 'Delivery Confidence', val: `${health?.confidence || 89}%`, color: 'text-emerald-400' },
                        { label: 'Project Health Score', val: `${health?.score || 87} / 100`, color: 'text-emerald-400' },
                        { label: 'Sprint Velocity Trend', val: health?.sprintVelocity || 'Stable', color: 'text-indigo-400' },
                        { label: 'Capital Efficiency', val: '94% On Target', color: 'text-emerald-400' }
                      ],
                      sections: [
                        { title: 'Delivery Velocity & ROI Metrics', items: [`Total engineering capacity delivered: ${completedSP} Story Points across ${tasks.filter(t => t.status === 'done').length} completed features.`, `Sprint execution rate: ${health?.sprintVelocity || 'Stable'} velocity trend with low timeline risk.`] },
                        { title: 'Milestone Projections & Market Readiness', items: [`Target product delivery remains on schedule with ${health?.confidence || 89}% confidence.`, `Core infrastructure and feature architecture successfully validated.`] }
                      ]
                    }
                  };

                  const currentConfig = personaConfigs[selectedAudience] || personaConfigs.ceo;

                  return (
                    <div className="p-5 rounded-xl border border-zinc-200/5 bg-zinc-950/40 space-y-6">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-widest">Audience View: {selectedAudience.toUpperCase()}</span>
                        <h4 className="text-lg font-bold text-white mt-1">{currentConfig.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{currentConfig.subtitle}</p>
                      </div>

                      {/* Summary banner */}
                      <div className="p-4 rounded-lg border border-indigo-500/15 bg-indigo-500/5 text-xs text-zinc-300 leading-relaxed font-medium">
                        {currentConfig.summary}
                      </div>

                      {/* Metric Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentConfig.metrics.map((m: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg border border-zinc-200/5 bg-zinc-900/60 space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-mono block">{m.label}</span>
                            <span className={`text-sm font-bold font-mono ${m.color}`}>{m.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Sections Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {currentConfig.sections.map((sec: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg border border-zinc-200/5 bg-zinc-900/40 space-y-2">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              <span>{sec.title}</span>
                            </h5>
                            <div className="space-y-1.5 text-xs text-zinc-400">
                              {sec.items.map((item: string, i: number) => (
                                <p key={i} className="leading-relaxed flex items-start gap-1.5">
                                  <span className="text-indigo-400 shrink-0">•</span>
                                  <span>{item}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Reports Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Reports Generator Form */}
                <div className="lg:col-span-1 p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                        <span>AI Document Compiler</span>
                      </h3>
                      <p className="text-xs text-zinc-500">Configure report generation scopes.</p>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Report Type */}
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-400">Report Scope</label>
                        <select 
                          value={genReportType}
                          onChange={(e) => setGenReportType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="weekly_report">Weekly Status Report</option>
                          <option value="sprint_report">Sprint Retrospective Summary</option>
                          <option value="project_report">Project Alignment Review</option>
                          <option value="risk_report">Architectural Risk Audit</option>
                        </select>
                      </div>

                      {/* Tone/Style */}
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-400">Tone / Format Style</label>
                        <select 
                          value={genReportStyle}
                          onChange={(e) => setGenReportStyle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="professional">Professional Consultant</option>
                          <option value="technical">Deep Technical Engineer</option>
                          <option value="executive">High-Level Executive</option>
                        </select>
                      </div>

                      {/* Length */}
                      <div className="space-y-1">
                        <label className="font-semibold text-zinc-400">Report Length</label>
                        <select 
                          value={genReportLength}
                          onChange={(e) => setGenReportLength(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white focus:outline-none cursor-pointer"
                        >
                          <option value="short">Brief Audit (Short)</option>
                          <option value="medium">Standard Report (Medium)</option>
                          <option value="long">Detailed Specification (Long)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCompileReport}
                    disabled={genReportLoading}
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{genReportLoading ? "Compiling Document..." : "Compile AI Report"}</span>
                  </button>
                </div>

                {/* Compiled Reports Feed list */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <ReportIcon className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Workspace Reports Logs</span>
                    </h3>
                    <p className="text-xs text-zinc-500">Historical compiled documents and PDF downloads.</p>
                  </div>

                  {reports.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-lg">
                      <span>No reports generated yet. Use the compiler block to generate one.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {reports.map((rep) => (
                        <div key={rep._id} className="p-4 bg-zinc-950/40 border border-zinc-200/5 hover:border-zinc-800 transition-all rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{rep.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-bold uppercase font-mono">
                                {rep.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-550 line-clamp-1">{rep.summary}</p>
                            <span className="text-[10px] text-zinc-600 block font-mono">
                              Created: {new Date(rep.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <button 
                            onClick={() => window.open(`http://localhost:5000/api/ai/reports/${rep._id}/pdf`, '_blank')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/10 hover:bg-zinc-800 text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Download className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Generated Report Content display preview */}
              {(genReportLoading || genReportText) && (
                <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                      <span>Report Compilation Preview</span>
                    </h3>

                    {newlyCreatedReportId && (
                      <button 
                        onClick={() => window.open(`http://localhost:5000/api/ai/reports/${newlyCreatedReportId}/pdf`, '_blank')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>

                  {genReportLoading ? (
                    <div className="py-12 flex items-center justify-center text-zinc-500 text-xs">
                      <span>AI Scrum Master and Risk Analyzer are running code reviews, backlog velocity audits, and compiling executive summaries...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-350 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[380px] p-5 bg-black/40 border border-zinc-800 rounded-lg font-mono">
                      {genReportText}
                    </div>
                  )}
                </div>
              )}

              {/* AI Meeting Notes Widget */}
              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <FileText className="h-4.5 w-4.5 text-indigo-400" />
                      <span>AI Meeting Notes & Action Extraction</span>
                    </h3>
                    <p className="text-xs text-zinc-400">Upload meeting transcripts → AI automatically extracts decisions, action items, risks, and updates project tasks.</p>
                  </div>
                  <button
                    onClick={() => setMeetingModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload Transcript</span>
                  </button>
                </div>

                {/* Meeting Notes List */}
                {meetingNotesList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl space-y-2">
                    <FileText className="h-8 w-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">No meeting notes uploaded yet.</p>
                    <p className="text-[11px] text-zinc-600">Click "Upload Transcript" to parse meeting notes into actionable backlog items.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meetingNotesList.map((note: any) => (
                      <div key={note._id} className="p-4 rounded-xl border border-zinc-200/10 bg-zinc-950/40 space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                          <h4 className="text-xs font-bold text-white font-mono">{note.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Decisions */}
                        {note.extractedData?.decisions?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">Decisions ({note.extractedData.decisions.length})</span>
                            {note.extractedData.decisions.map((d: any, idx: number) => (
                              <p key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{d.text} {d.owner ? <span className="text-[10px] text-zinc-500 font-mono">({d.owner})</span> : null}</span>
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Action Items */}
                        {note.extractedData?.actionItems?.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono">Action Items ({note.extractedData.actionItems.length})</span>
                            {note.extractedData.actionItems.map((a: any, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-200 flex justify-between items-center">
                                <span>{a.text}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                                  {a.owner || 'Alice'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}


          {/* TAB: GITHUB SYNC */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              
              {/* Header Sync Banner */}
              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white font-mono">{githubData?.repoName || 'repository-sync'}</h2>
                    <a
                      href={githubData?.repoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Real-time synchronization of commits, pull requests, branches, and code review requests.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] text-zinc-500 font-mono hidden sm:block">
                    <span>Last Synced: </span>
                    <span className="text-zinc-300 font-bold">
                      {githubData?.lastSyncedAt ? new Date(githubData.lastSyncedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>

                  <button
                    onClick={handleSyncGithub}
                    disabled={githubSyncing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${githubSyncing ? 'animate-spin' : ''}`} />
                    <span>{githubSyncing ? 'Syncing...' : 'Sync Repository'}</span>
                  </button>
                </div>
              </div>

              {/* 4 GitHub Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Recent Commits */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <GitCommit className="h-4 w-4 text-emerald-400" />
                      <span>Recent Commits</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {githubData?.commits?.length || 0} commits
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(!githubData?.commits || githubData.commits.length === 0) ? (
                      <p className="text-xs text-zinc-500 italic py-2">No commits recorded yet.</p>
                    ) : (
                      githubData.commits.map((commit: any) => (
                        <div key={commit.hash} className="p-3 rounded-lg border border-zinc-200/5 bg-zinc-950/40 space-y-2 hover:border-zinc-800 transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs text-zinc-200 font-medium font-sans leading-snug">{commit.message}</p>
                            <span className="font-mono text-[10px] text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                              {commit.hash}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono pt-1 border-t border-zinc-900">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-zinc-300 font-semibold">{commit.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400">{commit.branch || 'main'}</span>
                              <span>{new Date(commit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Review Requests */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <Users className="h-4 w-4 text-amber-400" />
                      <span>Review Requests</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                      {githubData?.pullRequests?.filter((pr: any) => pr.isReviewRequested || pr.status === 'open').length || 0} pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(!githubData?.pullRequests || githubData.pullRequests.filter((pr: any) => pr.isReviewRequested || pr.status === 'open').length === 0) ? (
                      <p className="text-xs text-zinc-500 italic py-2">No pending review requests.</p>
                    ) : (
                      githubData.pullRequests
                        .filter((pr: any) => pr.isReviewRequested || pr.status === 'open')
                        .map((pr: any) => (
                          <div key={pr.id} className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2.5">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-amber-400">#{pr.number}</span>
                                <h4 className="text-xs font-bold text-white leading-snug">{pr.title}</h4>
                              </div>
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                                Review Requested
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                              <span>Author: <strong className="text-zinc-200">{pr.author}</strong></span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">+{pr.additions}</span>
                                <span className="text-red-400">-{pr.deletions}</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                              <span>Assigned Reviewers:</span>
                              <div className="flex gap-1">
                                {pr.reviewers?.map((rev: string) => (
                                  <span key={rev} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                                    {rev}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* 3. Open PRs */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <GitPullRequest className="h-4 w-4 text-indigo-400" />
                      <span>Open Pull Requests</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {githubData?.pullRequests?.filter((pr: any) => pr.status === 'open').length || 0} active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(!githubData?.pullRequests || githubData.pullRequests.filter((pr: any) => pr.status === 'open').length === 0) ? (
                      <p className="text-xs text-zinc-500 italic py-2">No open pull requests.</p>
                    ) : (
                      githubData.pullRequests
                        .filter((pr: any) => pr.status === 'open')
                        .map((pr: any) => (
                          <div key={pr.id} className="p-3.5 rounded-lg border border-zinc-200/5 bg-zinc-950/40 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-indigo-400">#{pr.number}</span>
                                <h4 className="text-xs font-bold text-white">{pr.title}</h4>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-1">
                              <div className="flex items-center gap-1.5">
                                <GitBranch className="h-3 w-3 text-zinc-400" />
                                <span>{pr.sourceBranch} ➔ {pr.targetBranch}</span>
                              </div>
                              <span className="text-zinc-400">by {pr.author}</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* 4. Merged PRs */}
                <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/5 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      <span>Merged PRs</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {githubData?.pullRequests?.filter((pr: any) => pr.status === 'merged').length || 0} merged
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(!githubData?.pullRequests || githubData.pullRequests.filter((pr: any) => pr.status === 'merged').length === 0) ? (
                      <p className="text-xs text-zinc-500 italic py-2">No merged pull requests.</p>
                    ) : (
                      githubData.pullRequests
                        .filter((pr: any) => pr.status === 'merged')
                        .map((pr: any) => (
                          <div key={pr.id} className="p-3.5 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-purple-400">#{pr.number}</span>
                                <h4 className="text-xs font-bold text-white">{pr.title}</h4>
                              </div>
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
                                Merged
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-900">
                              <span>Merged by <strong className="text-zinc-200">{pr.author}</strong></span>
                              <span className="text-zinc-500">
                                {pr.mergedAt ? new Date(pr.mergedAt).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: CHAT */}
          {activeTab === 'chat' && (
            <div className="border border-zinc-200/10 rounded-xl bg-zinc-900/40 glass-panel h-[550px] flex flex-col overflow-hidden">
              
              {/* Chat Title bar */}
              <div className="p-4 border-b border-zinc-200/10 bg-zinc-950/60 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Terminal className="h-4.5 w-4.5 animate-pulse" />
                <span>DocuMind ProjectPilot Session</span>
              </div>

              {/* Messages display */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'border border-zinc-200/10 bg-zinc-950/80 text-zinc-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Streaming Chunk */}
                {typingText && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-xl p-4 border border-zinc-200/10 bg-zinc-950/80 text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {typingText}
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {chatLoading && !typingText && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 p-3 rounded-lg border border-zinc-200/10 bg-zinc-950/40">
                      <span className="h-2 w-2 rounded-full bg-zinc-500 animate-typing-dot" />
                      <span className="h-2 w-2 rounded-full bg-zinc-500 animate-typing-dot" />
                      <span className="h-2 w-2 rounded-full bg-zinc-500 animate-typing-dot" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input controls */}
              <div className="p-4 border-t border-zinc-200/10 bg-zinc-950/40 space-y-3">
                
                {/* Suggested prompt shortcuts */}
                <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                  {suggestedPrompts.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendChat(p)}
                      className="px-3 py-1.5 rounded-full border border-zinc-200/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-indigo-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Standard Input Form */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(chatMsg); }}
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Ask ProjectPilot AI Engineering Manager a question..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading}
                    className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* Smart Assignment AI Modal */}
        {assignModalTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg p-6 rounded-2xl border border-zinc-200/10 bg-zinc-900 glass-panel space-y-6">
              <div className="flex justify-between items-start border-b border-zinc-200/5 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">AI Smart Assignment</span>
                  <h3 className="text-base font-bold text-white mt-1">{assignModalTask.title}</h3>
                </div>
                <button
                  onClick={() => setAssignModalTask(null)}
                  className="text-zinc-500 hover:text-white text-xs font-mono px-2 py-1 rounded bg-zinc-800"
                >
                  ✕ Close
                </button>
              </div>

              {!smartAssignData ? (
                <div className="py-10 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
                  <UserCheck className="h-6 w-6 text-indigo-400 animate-bounce" />
                  <span>Matching team skill sets & workload capacity...</span>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* AI Recommendation Highlight Card */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        Recommended Assignee
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                        {smartAssignData.confidence}% Match Confidence
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm font-mono shrink-0">
                        {smartAssignData.recommendedAssignee?.name?.[0] || 'A'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{smartAssignData.recommendedAssignee?.name}</span>
                          <span className="text-xs font-normal text-zinc-400">({smartAssignData.recommendedAssignee?.role})</span>
                        </h4>
                        <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed font-sans">
                          {smartAssignData.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Workload Breakdown */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Team Capacity Audit</h5>
                    <div className="space-y-2">
                      {smartAssignData.allCandidates?.map((cand: any) => (
                        <div key={cand.name} className="p-2.5 rounded-lg border border-zinc-200/5 bg-zinc-950/40 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white">{cand.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono ml-2">({cand.role})</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {cand.loadSP} SP current load
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Semantic Search Modal */}
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl p-6 rounded-2xl border border-zinc-200/10 bg-zinc-900 glass-panel space-y-6 max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center border-b border-zinc-200/5 pb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white font-mono">Semantic Workspace Search</h3>
                </div>
                <button 
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformSearch(searchQuery);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask e.g., 'Where did we discuss authentication?'"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{searching ? 'Searching...' : 'Search'}</span>
                </button>
              </form>

              {/* Sample Queries */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] text-zinc-500 font-mono">Try searching:</span>
                {["Where did we discuss authentication?", "Payment API failure", "Release readiness"].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setSearchQuery(sample);
                      handlePerformSearch(sample);
                    }}
                    className="px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>

              {/* Search Results List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs font-mono">
                    {searching ? "Searching PRD, Sprint notes, Reports, and Chat history..." : "Type a question to search across all workspace artifacts."}
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-zinc-200/5 bg-zinc-950/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {item.sourceType}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                          {item.date && <span>{item.date}</span>}
                          <span className="text-emerald-400 font-bold">{item.relevanceScore}% Match</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-2.5 rounded border border-zinc-800/50">
                        "{item.snippet}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Meeting Notes Upload Modal */}
        {meetingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-xl p-6 rounded-2xl border border-zinc-200/10 bg-zinc-900 glass-panel space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-200/5 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white font-mono">Upload Meeting Transcript</h3>
                </div>
                <button
                  onClick={() => setMeetingModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Meeting Title</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g. Sprint 3 Engineering Sync"
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-300">Transcript Content</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMeetingTitle("Sprint 3 Architecture Sync");
                        setMeetingTranscript(`Alice: Agreed to use JWT authentication for secure sessions.\nBob: I will implement the database connection pool in MongoDB.\nCharlie: Urgent concern: Third-party API rate limits on payment Gateway endpoint.`);
                      }}
                      className="text-[10px] text-indigo-400 hover:underline font-mono cursor-pointer"
                    >
                      + Load Sample Transcript
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={meetingTranscript}
                    onChange={(e) => setMeetingTranscript(e.target.value)}
                    placeholder="Paste meeting transcript text here..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setMeetingModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-700 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadMeetingNote}
                    disabled={meetingLoading || !meetingTranscript.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{meetingLoading ? 'Extracting Action Items...' : 'Extract & Update Tasks'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Command Palette Component */}

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSelectAction={handleSelectCommandAction}
        />

        {/* Keyboard Shortcuts Modal Component */}
        <KeyboardShortcutsModal
          isOpen={shortcutsModalOpen}
          onClose={() => setShortcutsModalOpen(false)}
        />

        {/* Agent Reasoning Panel */}
        {agentReasoningOpen && (
          <AgentReasoningPanel
            onClose={() => setAgentReasoningOpen(false)}
            projectName={project?.name}
          />
        )}

      </div>
    </DashboardLayout>
  );
}


