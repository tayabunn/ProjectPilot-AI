'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ + K / Ctrl + K', description: 'Open Command Palette' },
    { key: 'G then O', description: 'Go to Overview Tab' },
    { key: 'G then K', description: 'Go to Kanban Board' },
    { key: 'G then D', description: 'Go to Dependency Graph' },
    { key: 'G then S', description: 'Go to Sprint Planning' },
    { key: 'G then R', description: 'Go to AI Reports' },
    { key: 'G then G', description: 'Go to GitHub Sync' },
    { key: 'G then C', description: 'Go to AI Chat' },
    { key: '/', description: 'Open Workspace Search' },
    { key: 'V', description: 'Toggle Voice Mode' },
    { key: '?', description: 'Open Keyboard Shortcuts Guide' },
    { key: 'ESC', description: 'Close Modals & Drawers' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl border border-zinc-200/10 bg-zinc-900 glass-panel p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-zinc-200/5 pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-mono">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-zinc-200/5 bg-zinc-950/40 flex justify-between items-center text-xs">
              <span className="text-zinc-300 font-sans font-medium">{sc.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-indigo-300 font-mono text-[10px] font-bold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[10px] text-zinc-500 font-mono">
          Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">ESC</kbd> anytime to dismiss overlays.
        </div>
      </div>
    </div>
  );
}
