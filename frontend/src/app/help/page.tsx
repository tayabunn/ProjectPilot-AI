'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, HelpCircle, ArrowRight, BookOpen, MessageSquare, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      q: 'How does the PRD Multi-Agent planning pipeline work?',
      a: 'When you upload a Product Requirement Document (PRD), ProjectPilot launches a synchronized multi-agent graph. The Planner Agent extracts business goals and defines milestone phases. The Research Agent proposes architectural dependencies and stack components. Finally, the Issue Generator and Risk Analyzer break these phases into granular backlog issues with mitigation tags.'
    },
    {
      q: 'Can I upload files other than PDF, DOCX, and TXT?',
      a: 'Currently, the document parsing intelligence is optimized for structured text specifications stored in standard PDF, DOCX, or raw TXT file systems. Direct integrations with Markdown (.md) documents are supported inside text formatting fields.'
    },
    {
      q: 'How are Sprint Burndown charts computed?',
      a: 'Sprint Burndown charts utilize Recharts to render planned ideal sprint remaining story points against actual daily progress logs. The ideal path calculates story points reduction evenly over the sprint cycle, while the actual points line registers completions stored inside the tasks backlog.'
    },
    {
      q: 'Can I download generated AI Scrum reports as PDF?',
      a: 'Yes! Navigate to the AI Reports tab inside your workspace page, configure your compiler scopes (Weekly Report, Sprint Report, Project Alignment, Risk Audit), compile the markdown summary, and click the "Download PDF" button to trigger a print sheet formatted using PDFKit.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(search.toLowerCase()) || 
    faq.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-semibold">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Support Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Help Center</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            Find answers to common questions about agent planning workflows, sprint velocity analytics, and reports.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full pl-9 pr-4 py-3 rounded-lg border border-zinc-200/10 bg-zinc-900/40 text-white placeholder-zinc-550 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-zinc-800 pb-2 text-indigo-400 font-mono">Frequently Asked Questions</h2>
          
          {filteredFaqs.length === 0 ? (
            <p className="text-center py-12 text-zinc-500 text-xs">No articles matching your search query.</p>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border border-zinc-200/10 bg-zinc-900/20 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-white">{faq.q}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-200/5 bg-zinc-950/20">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Options cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Read API Reference</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Explore integration specs and endpoint mappings to build custom automation workflows.
              </p>
            </div>
            <a href="/about" className="text-xs font-semibold text-indigo-400 hover:text-white flex items-center gap-1 mt-3">
              <span>View specs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Contact Engineering Support</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Got custom stack configurations or billing questions? Reach out to support teams.
              </p>
            </div>
            <a href="/contact" className="text-xs font-semibold text-emerald-400 hover:text-white flex items-center gap-1 mt-3">
              <span>Support ticket</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
