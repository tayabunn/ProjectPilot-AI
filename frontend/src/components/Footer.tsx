import React from 'react';
import Link from 'next/link';
import { Terminal, Globe, Send, Briefcase, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/10 bg-zinc-950/40 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <Terminal className="h-5 w-5 text-indigo-500" />
              <span>ProjectPilot <span className="text-indigo-500">AI</span></span>
            </Link>
            <p className="text-sm">
              Your AI-powered Engineering Manager. Streamlining product plans, roadmaps, and delivery metrics.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">Explore Projects</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">How it Works</Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">Blog Press</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Social & Contact</h3>
            <div className="flex items-center gap-4 mb-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="GitHub">
                <Globe className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Twitter">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
                <Briefcase className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Mail className="h-4 w-4" />
              <span>support@projectpilot.ai</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <span>&copy; {new Date().getFullYear()} ProjectPilot AI. All rights reserved.</span>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
