'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Layers, 
  Kanban, 
  GitMerge, 
  CalendarRange, 
  FileText, 
  GitPullRequest, 
  MessageSquare, 
  Mic, 
  Zap, 
  Plus, 
  Sparkles,
  Command,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string) => void;
}

interface ActionItem {
  id: string;
  label: string;
  category: 'Navigation' | 'AI Actions' | 'Management';
  icon: any;
  shortcut?: string;
}

export default function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: ActionItem[] = [
    { id: 'nav_overview', label: 'Go to Project Overview', category: 'Navigation', icon: Layers, shortcut: 'G O' },
    { id: 'nav_kanban', label: 'Go to Kanban Board', category: 'Navigation', icon: Kanban, shortcut: 'G K' },
    { id: 'nav_dependencies', label: 'Go to Dependency Graph', category: 'Navigation', icon: GitMerge, shortcut: 'G D' },
    { id: 'nav_sprints', label: 'Go to Sprint Planning', category: 'Navigation', icon: CalendarRange, shortcut: 'G S' },
    { id: 'nav_reports', label: 'Go to AI Reports', category: 'Navigation', icon: FileText, shortcut: 'G R' },
    { id: 'nav_github', label: 'Go to GitHub Sync', category: 'Navigation', icon: GitPullRequest, shortcut: 'G G' },
    { id: 'nav_chat', label: 'Open AI Manager Chat', category: 'Navigation', icon: MessageSquare, shortcut: 'G C' },

    { id: 'action_search', label: 'Semantic Workspace Search', category: 'AI Actions', icon: Search, shortcut: '/' },
    { id: 'action_voice', label: 'Toggle Voice Mode Command', category: 'AI Actions', icon: Mic, shortcut: 'V' },
    { id: 'action_cascade', label: 'Simulate Agentic Reprioritization Cascade', category: 'AI Actions', icon: Zap },
    { id: 'action_report', label: 'Compile Executive Report', category: 'AI Actions', icon: Sparkles },
    { id: 'action_meeting', label: 'Upload Meeting Transcript', category: 'AI Actions', icon: FileText },

    { id: 'action_create_sprint', label: 'Create New Sprint', category: 'Management', icon: Plus },
    { id: 'action_shortcuts', label: 'View Keyboard Shortcuts', category: 'Management', icon: HelpCircle, shortcut: '?' }
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        onSelectAction(filteredActions[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl border border-zinc-200/10 bg-zinc-900 shadow-2xl glass-panel overflow-hidden space-y-0"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200/10 bg-zinc-950/60">
          <Search className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search workspace... (e.g. Kanban, Search, Report)"
            className="w-full bg-transparent text-white placeholder-zinc-500 text-xs focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-mono">
              No matching commands found.
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    onSelectAction(action.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-md'
                      : 'text-zinc-300 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    <span>{action.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {action.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {action.shortcut && (
                      <kbd className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {action.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`h-3.5 w-3.5 opacity-0 ${isSelected ? 'opacity-100 text-white' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2 bg-zinc-950/80 border-t border-zinc-200/10 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" /> Navigation Command Palette
          </span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
