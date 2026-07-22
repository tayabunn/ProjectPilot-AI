'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './Providers';
import { 
  Terminal, 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  FolderKanban, 
  LogOut, 
  User,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Command
} from 'lucide-react';
import { useState } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, theme, toggleTheme } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Terminal className="h-10 w-10 text-indigo-500 animate-bounce" />
          <p className="text-sm text-zinc-400 font-medium">Restoring workspace session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Sandbox', href: '/explore', icon: Search },
    { name: 'Add Project', href: '/items/add', icon: PlusCircle },
    { name: 'Manage Projects', href: '/items/manage', icon: FolderKanban },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans transition-colors duration-300">
      
      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col border-r border-zinc-200/10 bg-zinc-950 p-5 space-y-6 shrink-0 transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-zinc-800 transition-all z-20"
          title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white overflow-hidden px-1">
          <Terminal className="h-6 w-6 text-indigo-500 shrink-0" />
          {!isCollapsed && <span className="truncate font-mono tracking-tight">ProjectPilot</span>}
        </Link>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer profile & logout */}
        <div className="pt-4 border-t border-zinc-200/10 space-y-3">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
              <User className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/10 bg-zinc-950/40 flex items-center justify-between px-6 md:px-8">
          <button className="md:hidden text-zinc-400 hover:text-white cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Command Palette Trigger */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-zinc-500 hidden sm:flex items-center gap-1.5 font-mono">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-zinc-300 font-medium">Default Sandbox</span>
            </div>
            
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-700/70 bg-zinc-900/80 text-zinc-400 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm"
            >
              <Command className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Command Palette</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700 font-bold">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200/10 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 transition-colors shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>
            <span className="text-xs px-2.5 py-1 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Linear UI Mode
            </span>
          </div>
        </header>

        {/* Children scroll canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
