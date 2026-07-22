'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api';
import { 
  PlusCircle, 
  Upload, 
  Link as LinkIcon, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function AddItemPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState('🚀');
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    setLoading(true);

    try {
      // 1. Create Project Details
      setStatusMsg('Initializing project workspace...');
      const projectRes = await api.post('/projects', {
        name,
        description,
        priority,
        deadline,
        repoUrl,
        thumbnail
      });
      const projectId = projectRes.data._id;

      // 2. Upload PRD if present
      if (file) {
        setStatusMsg('Uploading Product Requirement Document (PRD)...');
        const formData = new FormData();
        formData.append('file', file);
        const docRes = await api.post(`/projects/${projectId}/prd`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const docId = docRes.data.document.id;

        // 3. Trigger LangGraph AI Planning Agents
        setStatusMsg('AI Engineering Manager is constructing roadmap, milestones, and issues backlog...');
        await api.post('/ai/analyze-prd', {
          projectId,
          documentId: docId
        });
      }

      setStatusMsg('Workspace configured successfully! Redirecting...');
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to construct AI workspace.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-indigo-500" />
            <span>Initialize New Workspace</span>
          </h1>
          <p className="text-sm text-zinc-400">Launch a project, upload specifications, and let AI build the roadmap.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-lg border border-red-500/15 bg-red-950/10 text-sm text-red-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="flex items-center gap-2.5 p-4 rounded-lg border border-indigo-500/15 bg-indigo-500/10 text-sm text-indigo-400">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project Name */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Project Name *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Portal Application API"
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Overview / Scope Description</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary description details about goals..."
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Upload PRD Specifications (Optional)</label>
              <div className="border border-dashed border-zinc-800 rounded-lg p-5 text-center bg-zinc-950/40 hover:bg-zinc-950 transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-xs text-zinc-400 font-medium">
                    {file ? file.name : "Select PDF, DOCX, or TXT file"}
                  </span>
                  <span className="text-[10px] text-zinc-600">Max size: 10MB</span>
                </div>
              </div>
            </div>

            {/* Optional Workspace Thumbnail */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Optional Workspace Thumbnail (Emoji or URL)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emoji Select List */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Pick default emoji icon:</span>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-zinc-200/10 bg-zinc-950">
                    {['🚀', '💻', '📊', '🎨', '🔒', '💡', '🤖', '⚡', '📅', '🌐'].map(emo => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setThumbnail(emo)}
                        className={`text-lg p-1.5 rounded-lg transition-all hover:bg-zinc-800 ${thumbnail === emo ? 'bg-indigo-600/35 scale-110 border border-indigo-500' : ''}`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL Option */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 block">Or enter custom URL/emoji:</span>
                  <input 
                    type="text" 
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="e.g. 🛠️ or https://example.com/logo.png"
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Priority Level</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            {/* Target Deadline */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Launch Deadline</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                  <Calendar className="h-4 w-4" />
                </span>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Repo Link */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">GitHub Repository Link (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <input 
                  type="url" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/company/repo"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-200/5 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Constructing Workspace..." : "Create Project Workspaces"}</span>
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
}
