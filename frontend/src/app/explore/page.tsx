'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../components/Providers';
import api from '../../services/api';
import { 
  Search, 
  SlidersHorizontal, 
  AlertTriangle, 
  Folder, 
  ArrowRight, 
  Clock 
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  priority: string;
  status: string;
  riskScore: number;
  thumbnail?: string;
  createdAt: string;
}

export default function ExplorePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getProjectTags = (proj: Project) => {
    const tags = ['SaaS'];
    const text = (proj.name + ' ' + (proj.description || '')).toLowerCase();
    if (text.includes('api') || text.includes('backend') || text.includes('route') || text.includes('node') || text.includes('express')) {
      tags.push('Backend');
    }
    if (text.includes('front') || text.includes('react') || text.includes('next') || text.includes('ui') || text.includes('page') || text.includes('ts') || text.includes('js')) {
      tags.push('Frontend');
    }
    if (text.includes('ai') || text.includes('agent') || text.includes('langgraph') || text.includes('scrum') || text.includes('planner') || text.includes('risk')) {
      tags.push('AI');
    }
    return tags;
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: {
          search,
          status,
          priority,
          sort,
          page,
          limit: 8,
          public: true
        }
      });
      setProjects(res.data.projects || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce/trigger fetch on filter change
    fetchProjects();
  }, [status, priority, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const filteredProjects = projects.filter(proj => {
    if (selectedTag === 'all') return true;
    return getProjectTags(proj).includes(selectedTag);
  });

  const content = (
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Explore Projects</h1>
          <p className="text-sm text-zinc-400">Search and audit project spaces across the enterprise.</p>
        </div>

        {/* Filter and Search Bar */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Search className="h-4 w-4" />
              </span>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-900/40 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              Search
            </button>
          </div>

          {/* Additional Filter Selects */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-200/5 text-sm">
            <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select 
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Tags Filter */}
            <select 
              value={selectedTag}
              onChange={(e) => { setSelectedTag(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Tags</option>
              <option value="AI">AI / Agents</option>
              <option value="Backend">Backend / API</option>
              <option value="Frontend">Frontend / UI</option>
              <option value="SaaS">SaaS / Web</option>
            </select>

            {/* Sort Order */}
            <select 
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-white text-xs focus:outline-none focus:border-indigo-500 cursor-pointer ml-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Alphabetical</option>
              <option value="risk">Highest Risk</option>
            </select>
          </div>
        </form>

        {/* Results Grid (4 cards per row on desktop) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-60 rounded-xl border border-zinc-200/10 bg-zinc-900/20 animate-pulse space-y-4 p-5">
                <div className="h-4 w-1/3 bg-zinc-800 rounded" />
                <div className="h-8 w-3/4 bg-zinc-800 rounded" />
                <div className="h-16 w-full bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-16 rounded-xl border border-zinc-200/10 bg-zinc-900/10">
            <Folder className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No workspaces match your query. Try adjusting your filter terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project._id}
                className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between h-[270px] hover:shadow-glow group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                      {project.status}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      project.priority === 'urgent' 
                        ? 'border border-red-500/20 bg-red-500/5 text-red-400' 
                        : 'border border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}>
                      {project.priority}
                    </span>
                  </div>

                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5">
                    <span className="shrink-0">{project.thumbnail || '🚀'}</span>
                    <span className="truncate">{project.name}</span>
                  </h3>

                  {/* Tags Pills */}
                  <div className="flex flex-wrap gap-1">
                    {getProjectTags(project).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-850 text-[9px] font-semibold text-zinc-550 font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {project.description || 'No description specified for this workspace.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-200/10 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>{project.riskScore}% Risk</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link 
                    href={user ? `/projects/${project._id}` : '/register'}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-950 hover:bg-indigo-600 border border-zinc-200/10 hover:border-indigo-600 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    <span>View Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-200/5">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-xs font-semibold text-white disabled:opacity-50 hover:bg-zinc-800 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200/10 bg-zinc-900 text-xs font-semibold text-white disabled:opacity-50 hover:bg-zinc-800 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {content}
      </main>
      <Footer />
    </div>
  );
}
