'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Terminal, Shield, Cpu, Sparkles, CheckSquare, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Behind the Engineering Managers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">About ProjectPilot AI</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            ProjectPilot AI was built to solve the fragmentation of modern Agile workflows by employing collaborative, multi-agent AI engineering teams.
          </p>
        </div>

        {/* Section: The Agent Architecture */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-3 text-indigo-400">Our Multi-Agent Orchestration</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Unlike simple text-generating chatbots, ProjectPilot AI deploys a coordinated workflow of specialized LLM sub-agents. Each agent represents a discrete role in software project management, collaborating in a structured execution graph:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>Planner Agent</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Parses uploaded raw Product Requirement Documents (PRD), extracts functional scope guidelines, and outputs high-level milestones.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>Research & Architecture Agent</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Evaluates specifications against modern technological stacks, recommending databases, libraries, and engineering designs.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <CheckSquare className="h-4 w-4 text-purple-400" />
                <span>Issue Generator Agent</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Drafts granular GitHub-style issues with acceptance criteria, story point sizing, and estimation metrics.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Risk Analyzer Agent</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Scans task dependencies, highlights critical paths, and flags unassigned key tickets before sprint execution.
              </p>
            </div>

          </div>
        </div>

        {/* Section: Contact Callout */}
        <div className="p-6 rounded-xl border border-zinc-200/10 bg-indigo-950/15 text-center space-y-4">
          <h3 className="font-bold text-white text-base">Want to integrate with your existing DevOps flow?</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            We offer custom enterprise licensing and configuration for direct self-hosted deployments.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white cursor-pointer"
          >
            Contact Sales
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
