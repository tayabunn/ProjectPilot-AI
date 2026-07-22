'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api';
import { 
  FolderKanban, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Search,
  Grid,
  List
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

export default function ManageItemsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to load projects for management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDuplicate = async (project: Project) => {
    setDuplicatingId(project._id);
    try {
      const res = await api.post('/projects', {
        name: `${project.name} (Copy)`,
        description: project.description,
        priority: project.priority,
        thumbnail: project.thumbnail || '🚀'
      });
      const duplicatedProject = res.data;
      setProjects(prev => [duplicatedProject, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      alert('Project duplication failed.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated tasks, sprints, and reports will be lost permanently.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-indigo-500" />
              <span>Manage Project Workspaces</span>
            </h1>
            <p className="text-sm text-zinc-400">Manage, review, duplicate or archive active workspace records.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input bar */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* View Mode Toggle Selectors */}
            <div className="flex items-center border border-zinc-200/10 bg-zinc-950 p-1 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-800 text-indigo-400' : 'text-zinc-500 hover:text-white'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* List Table container */}
        {loading ? (
          <div className="p-12 border border-zinc-200/10 bg-zinc-900/40 rounded-xl space-y-4 animate-pulse">
            <div className="h-6 bg-zinc-800 rounded w-1/4" />
            <div className="h-20 bg-zinc-800 rounded w-full" />
            <div className="h-20 bg-zinc-800 rounded w-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-16 rounded-xl border border-zinc-200/10 bg-zinc-900/10">
            <p className="text-zinc-500 text-sm mb-4">No projects available to manage.</p>
            <Link 
              href="/items/add" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer"
            >
              Add Project
            </Link>
          </div>
        ) : (
          <div>
            {viewMode === 'table' ? (
              <div className="border border-zinc-200/10 rounded-xl bg-zinc-900/40 glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-zinc-950/60 border-b border-zinc-200/10 text-xs font-bold text-zinc-400 uppercase">
                      <tr>
                        <th className="p-4">Project Name</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Priority</th>
                        <th className="p-4">Risk Index</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/5">
                      {filteredProjects.map((project) => (
                        <tr key={project._id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-4 font-semibold text-white">
                            <div className="max-w-xs truncate flex items-center gap-1.5">
                              <span className="shrink-0">{project.thumbnail || '🚀'}</span>
                              <span className="truncate">{project.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-bold uppercase">
                              {project.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              project.priority === 'urgent' 
                                ? 'border border-red-500/20 bg-red-500/5 text-red-400' 
                                : 'border border-zinc-700 bg-zinc-800 text-zinc-450'
                            }`}>
                              {project.priority}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              <span>{project.riskScore}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-zinc-500">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-3">
                              <Link 
                                href={`/projects/${project._id}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200/10 hover:bg-zinc-800 hover:text-white transition-all text-xs cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-zinc-400" />
                                <span>View</span>
                              </Link>
                              <button 
                                disabled={duplicatingId === project._id}
                                onClick={() => handleDuplicate(project)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200/10 hover:bg-zinc-800 hover:text-white transition-all text-xs cursor-pointer disabled:opacity-50"
                              >
                                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                                <span>{duplicatingId === project._id ? "Copying..." : "Duplicate"}</span>
                              </button>
                              <button 
                                disabled={deletingId === project._id}
                                onClick={() => handleDelete(project._id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/15 hover:bg-red-500/10 text-red-400 transition-all text-xs cursor-pointer disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>{deletingId === project._id ? "Deleting..." : "Delete"}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project._id} className="p-5 rounded-xl border border-zinc-200/10 bg-zinc-900/40 hover:border-indigo-500/30 transition-all flex flex-col justify-between h-44 hover:shadow-glow group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate flex items-center gap-1.5 max-w-[80%]">
                          <span className="shrink-0">{project.thumbnail || '🚀'}</span>
                          <span className="truncate">{project.name}</span>
                        </h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          project.priority === 'urgent' 
                            ? 'border border-red-500/20 bg-red-500/5 text-red-400' 
                            : 'border border-zinc-750 bg-zinc-800 text-zinc-450'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-450 line-clamp-2 leading-relaxed">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-200/10 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${project._id}`} className="p-1.5 rounded-lg border border-zinc-200/5 bg-zinc-950 text-zinc-400 hover:text-white transition-all">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button 
                          disabled={duplicatingId === project._id}
                          onClick={() => handleDuplicate(project)}
                          className="p-1.5 rounded-lg border border-zinc-200/5 bg-zinc-950 text-zinc-400 hover:text-white transition-all disabled:opacity-50 animate-none"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          disabled={deletingId === project._id}
                          onClick={() => handleDelete(project._id)}
                          className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>{project.riskScore}% Risk</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
