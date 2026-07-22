'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/Providers';
import { 
  ArrowRight, 
  Terminal, 
  Shield, 
  Cpu, 
  Sparkles, 
  Check, 
  BarChart3, 
  Users, 
  Zap, 
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [sliderVal, setSliderVal] = useState(60); // Interactive slider value
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false
  });
  const [emailSub, setEmailSub] = useState('');
  const [subbed, setSubbed] = useState(false);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubbed(true);
      setEmailSub('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Hero Section (Height limited to 60-70% of screen) */}
        <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-zinc-200/10 bg-radial-gradient">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(79,70,229,0.05),transparent)] pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 font-medium">
              <Sparkles className="h-3 w.3" />
              <span>Next-Gen AI Engineering Manager</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 max-w-4xl mx-auto leading-tight">
              Manage Software Lifecycles with autonomous AI Agents
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              ProjectPilot AI reads your PRD, structures your roadmap, creates GitHub issues, tracks delivery risks, and acts as your co-pilot Scrum Master.
            </p>

            {/* Interactive Element: Stats Slider */}
            <div className="max-w-md mx-auto p-4 rounded-xl border border-zinc-200/10 bg-zinc-900/60 glass-panel space-y-3">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>Configure AI Autonomy Index</span>
                <span className="text-indigo-400 font-bold">{sliderVal}% Autonomy</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={sliderVal} 
                onChange={(e) => setSliderVal(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-zinc-500">
                {sliderVal < 40 && "Manual Mode: AI acts only as a drafting assistant."}
                {sliderVal >= 40 && sliderVal < 80 && "Co-Pilot Mode: AI manages roadmap iterations with user approvals."}
                {sliderVal >= 80 && "Autonomous Mode: Agent updates schedules & tickets via repository sync webhooks."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                href={user ? "/dashboard" : "/login"} 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 cursor-pointer group"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/explore" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 border border-zinc-200/10 font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Explore Sandbox
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Features Grid */}
        <section className="py-20 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Full-Spectrum Engineering Control</h2>
              <p className="text-zinc-400">Core AI capabilities designed for technical product leaders.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4 hover:border-indigo-500/30 transition-all duration-200">
                <div className="h-10 w-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Document intelligence</h3>
                <p className="text-sm text-zinc-400">
                  Upload raw PRDs (PDF, TXT, Word documents). Our AI reads the document, pulls requirements, and maps out milestones.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4 hover:border-indigo-500/30 transition-all duration-200">
                <div className="h-10 w-10 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Risk & Bottleneck Analyzer</h3>
                <p className="text-sm text-zinc-400">
                  Detect blocker paths, long issues without estimations, and scheduling conflicts before sprints begin.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 space-y-4 hover:border-indigo-500/30 transition-all duration-200">
                <div className="h-10 w-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Automated PR Code Review</h3>
                <p className="text-sm text-zinc-400">
                  Sync your project with GitHub. AI will scan pull requests to check readability, suggest tests, and identify risks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How it Works (Roadmap timeline) */}
        <section className="py-20 bg-zinc-950 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Simple, Powerful Workflow</h2>
              <p className="text-zinc-400">From raw ideas to sprint-ready issue boards in under a minute.</p>
            </div>

            <div className="relative border-l border-zinc-800 ml-4 md:ml-8 pl-8 md:pl-12 space-y-10 max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-16 md:-left-20 top-1.5 h-8 w-8 rounded-full border border-indigo-500/20 bg-indigo-950 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">Upload Your Blueprint</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Upload a PRD document or describe requirements in plain text.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-16 md:-left-20 top-1.5 h-8 w-8 rounded-full border border-indigo-500/20 bg-indigo-950 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">Agentic Orchestration</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Our LangGraph multi-agent system runs background reasoning pipelines to split files into milestones and story points.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-16 md:-left-20 top-1.5 h-8 w-8 rounded-full border border-indigo-500/20 bg-indigo-950 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">Sprint & Deliver</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Track delivery on Kanban boards, review automated sprint velocity logs, and export PDF briefs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Live Sandbox Statistics */}
        <section className="py-16 bg-zinc-900/30 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-white">98%</div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Requirement coverage</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-indigo-500">10x</div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Planning efficiency</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-white">8,200+</div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Issues generated</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-indigo-500">2.4M</div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Hours estimated</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Highlights / Comparison */}
        <section className="py-20 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Outperforming Standard Issue Trackers</h2>
              <p className="text-zinc-400">Traditional PM vs ProjectPilot AI Engineering Management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl border border-red-500/10 bg-red-950/5 space-y-4">
                <h3 className="text-lg font-bold text-red-400">Manual Issue Planners</h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">&times;</span>
                    <span>Developers manual estimations. Story points are often inconsistent.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">&times;</span>
                    <span>No automated blockers detection between backend/frontend tasks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">&times;</span>
                    <span>Static checklists that require constant sprint updates.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-emerald-500/10 bg-emerald-950/5 space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">ProjectPilot AI Manager</h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <Check className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Auto-estimated story points and workload sizing powered by GPT-4/Gemini.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Calculates graph dependencies and flags blockers instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4.5 w-4.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Adapts tasks, estimates, and schedules live as status changes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Testimonials */}
        <section className="py-20 bg-zinc-900/10 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Loved by Engineering Leaders</h2>
              <p className="text-zinc-400">See how fast-growing teams are building products with ProjectPilot.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "ProjectPilot has saved our product team dozens of hours every single sprint. The AI-generated issue backlog was 90% ready for our developers on day one.",
                  author: "Sarah Jenkins",
                  role: "VP of Product",
                  company: "CloudScale",
                  avatarInitials: "SJ"
                },
                {
                  quote: "The risk analysis module flagged a nested API dependency loop that would have delayed our launch by two weeks. Absolutely indispensable tool.",
                  author: "David Chen",
                  role: "Engineering Director",
                  company: "VeloTech",
                  avatarInitials: "DC"
                },
                {
                  quote: "As a Scrum Master, I love the automated daily standup summaries and weekly progress PDF reports. It acts as an autonomous co-pilot.",
                  author: "Elena Rostova",
                  role: "Agile Coach",
                  company: "Novus Dev",
                  avatarInitials: "ER"
                }
              ].map((t, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between space-y-4">
                  <p className="text-sm text-zinc-300 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold font-mono">
                      {t.avatarInitials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.author}</div>
                      <div className="text-[11px] text-zinc-500">{t.role} &bull; {t.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Pricing */}
        <section className="py-20 border-b border-zinc-200/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Simple, Predictable Pricing</h2>
              <p className="text-zinc-400">Start for free, upgrade when your sprint velocity scales up.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="p-8 rounded-xl border border-zinc-200/10 bg-zinc-900/30 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <p className="text-sm text-zinc-500">Perfect for side projects & developers exploring AI.</p>
                  <div className="text-3xl font-black text-white pt-2">$0 <span className="text-sm font-medium text-zinc-500">/ month</span></div>
                </div>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>1 Active Project workspace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Basic AI PRD Parsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Manual Task & Backlog Sync</span>
                  </li>
                </ul>
                <Link href="/login" className="w-full text-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-xl border-2 border-indigo-500 bg-zinc-900/60 relative flex flex-col justify-between space-y-6 shadow-xl shadow-indigo-600/5">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase text-white">
                  Popular
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Pro</h3>
                  <p className="text-sm text-zinc-500">For fast-growing teams building production software.</p>
                  <div className="text-3xl font-black text-white pt-2">$39 <span className="text-sm font-medium text-zinc-500">/ month</span></div>
                </div>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Unlimited Active Projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Advanced LangGraph Multi-Agent Planner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Smart Recommendations & Risk Audits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Automated GitHub PR reviews</span>
                  </li>
                </ul>
                <Link href="/login" className="w-full text-center py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20">
                  Upgrade to Pro
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 rounded-xl border border-zinc-200/10 bg-zinc-900/30 flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Enterprise</h3>
                  <p className="text-sm text-zinc-500">For large scale enterprises requiring custom setups.</p>
                  <div className="text-3xl font-black text-white pt-2">Custom <span className="text-sm font-medium text-zinc-500">pricing</span></div>
                </div>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Everything in Pro plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Self-hosted / Local LLM integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Dedicated SLA Support & custom integrations</span>
                  </li>
                </ul>
                <Link href="/contact" className="w-full text-center py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Blog Preview */}
        <section className="py-20 border-b border-zinc-200/10 bg-zinc-900/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">From the Control Tower</h2>
              <p className="text-zinc-400">Industry insights, automated product management tips, and engineering advice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Scaling Engineering Velocity with Agentic AI Workflows",
                  desc: "Learn how autonomous agents can split specifications documents, write tests, and update agile kanban boards automatically.",
                  tag: "AI Agents",
                  readTime: "5 min read",
                  date: "July 12, 2026"
                },
                {
                  title: "How to Draft a High-Fidelity PRD (Product Requirement Document)",
                  desc: "The checklist to structuring clear, unambiguous product specs that AI planners and scrum masters can map to 100% test coverage.",
                  tag: "Product Management",
                  readTime: "7 min read",
                  date: "June 28, 2026"
                },
                {
                  title: "Preventing Delivery Risks and Blockers with Graph Sprints",
                  desc: "Why traditional board spreadsheets fail at detecting critical-path blockers, and how dependency networks resolve delivery logs.",
                  tag: "Agile Engineering",
                  readTime: "4 min read",
                  date: "June 15, 2026"
                }
              ].map((post, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/20 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="inline-flex px-2.5 py-0.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                      {post.tag}
                    </div>
                    <h3 className="text-base font-bold text-white hover:text-indigo-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {post.desc}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500 pt-2 border-t border-zinc-200/5">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: FAQ Accordion */}
        <section className="py-20 border-b border-zinc-200/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
              <p className="text-zinc-400">Everything you need to know about ProjectPilot AI.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What file formats does the PRD document parser support?",
                  a: "ProjectPilot AI currently supports PDF, Word documents (DOCX), and raw text logs (TXT). Max file size is 10MB."
                },
                {
                  q: "Can the AI push tickets to Jira or GitHub issues directly?",
                  a: "Yes. Once synced with GitHub or Jira credentials, you can export your roadmap backlog and generated issues in a single click."
                },
                {
                  q: "How does the AI analyze development risks?",
                  a: "Our Risk Analyzer Agent reviews dependency graphs, identifies critical paths, flags unassigned urgent issues, and computes a risk score from 0-100%."
                },
                {
                  q: "Is there a local LLM integration?",
                  a: "We support integrations with local Ollama APIs and key SaaS APIs like Gemini and OpenAI."
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-zinc-200/10 rounded-lg bg-zinc-900/30 overflow-hidden">
                  <button 
                    onClick={() => toggleFaq(idx)} 
                    className="w-full flex items-center justify-between p-5 text-left font-medium text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-indigo-400" />
                      <span>{faq.q}</span>
                    </span>
                    {faqOpen[idx] ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                  </button>
                  {faqOpen[idx] && (
                    <div className="p-5 border-t border-zinc-200/10 text-sm text-zinc-400 leading-relaxed bg-zinc-950/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Newsletter & Subscriptions */}
        <section className="py-20 bg-zinc-900/20 border-b border-zinc-200/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Subscribe to Tech & Product Updates</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Get bi-weekly briefings on automated workflow practices, prompt engineering frameworks, and product management templates.
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2">
              <input 
                type="email" 
                required
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all text-sm cursor-pointer shrink-0"
              >
                Join Newsletter
              </button>
            </form>
            {subbed && (
              <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Subscription successful! Welcome on board.</span>
              </p>
            )}
          </div>
        </section>

        {/* Section 8: CTA Section */}
        <section className="py-20 text-center relative overflow-hidden bg-gradient-to-t from-indigo-950/30 to-transparent">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to elevate your sprint lifecycles?</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Initialize your project workspaces, parse your specifications documents, and build sandbox environments.
            </p>
            <div className="pt-4">
              <Link 
                href={user ? "/dashboard" : "/login"} 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-xl shadow-indigo-600/30 cursor-pointer"
              >
                <span>Launch ProjectPilot AI</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
