'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './Providers';
import { Menu, X, Terminal, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/10 bg-zinc-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Terminal className="h-6 w-6 text-indigo-500 animate-pulse" />
          <span>ProjectPilot <span className="text-indigo-500">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/explore" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Contact
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/items/add" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Add Items
              </Link>
              <Link href="/items/manage" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Manage Items
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 transition-colors shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-300 font-medium">Hello, {user.name}</span>
              <button 
                onClick={logout} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-200/10 text-sm font-medium text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Launch App
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-zinc-200/10 bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-indigo-400" />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white cursor-pointer">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200/10 bg-zinc-950/95 px-4 py-4 space-y-3">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/explore" 
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Explore
          </Link>
          <Link 
            href="/about" 
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Contact
          </Link>
          
          {user ? (
            <div className="pt-2 border-t border-zinc-200/10 space-y-3">
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/items/add" 
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Add Items
              </Link>
              <Link 
                href="/items/manage" 
                onClick={() => setIsOpen(false)}
                className="block text-base font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Manage Items
              </Link>
              <div className="pt-2">
                <button 
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-900 border border-zinc-200/10 text-sm font-medium text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white cursor-pointer"
            >
              Launch App
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
