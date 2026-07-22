'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const posts: BlogPost[] = [
    {
      id: '1',
      title: 'Scaling Multi-Agent LLM Systems in Production',
      excerpt: 'Learn the architectural patterns and state preservation strategies required to orchestrate multiple specialized generative agents using LangGraph.',
      category: 'engineering',
      readTime: '8 min read',
      date: 'July 18, 2026',
      tags: ['LangGraph', 'LLM', 'System Design']
    },
    {
      id: '2',
      title: 'How to Write Product Specifications for AI Document Intelligence',
      excerpt: 'Discover formatting frameworks and requirement hierarchies that help AI Planner agents extract accurate milestones and dependencies from your PRDs.',
      category: 'product',
      readTime: '6 min read',
      date: 'July 12, 2026',
      tags: ['PRD', 'AI Analysis', 'Agile']
    },
    {
      id: '3',
      title: 'Measuring Sprint Velocity with AI Scrum Masters',
      excerpt: 'An in-depth look at how automated agents compile retrospective logs, velocity distributions, and burn-down ideal gradients without manual inputs.',
      category: 'agile',
      readTime: '5 min read',
      date: 'July 05, 2026',
      tags: ['Scrum', 'Velocity', 'Recharts']
    },
    {
      id: '4',
      title: 'Mitigating Delivery Risks Using Autonomous Code Audits',
      excerpt: 'How multi-agent risk analyzers check for dependency bottlenecks, integration limits, and roadmap timelines prior to code deployment.',
      category: 'engineering',
      readTime: '7 min read',
      date: 'June 28, 2026',
      tags: ['Risk Analysis', 'DevOps', 'CI/CD']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'product', label: 'Product Scope' },
    { id: 'agile', label: 'Agile & Scrum' }
  ];

  const filteredPosts = posts.filter(post => 
    activeCategory === 'all' || post.category === activeCategory
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-16 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-semibold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>ProjectPilot Press</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">The Engineering Blog</h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm">
            Insights on multi-agent systems, product management specifications, and autonomous agile workflows.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex justify-center border-b border-zinc-200/10 gap-4 text-xs sm:text-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`pb-3 font-medium transition-all cursor-pointer border-b-2 ${
                activeCategory === cat.id 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <article 
              key={post.id}
              className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4 hover:shadow-glow group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider font-mono">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {post.title}
                </h2>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200/10 flex justify-between items-center gap-4">
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((t, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950/60 text-[9px] font-semibold text-zinc-550 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-white transition-colors shrink-0">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
