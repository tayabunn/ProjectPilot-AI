'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 space-y-6">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-zinc-500 text-xs">Last updated: July 20, 2026</p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          At ProjectPilot AI, we prioritize user privacy. Document parsing inputs uploaded as PRDs (Product Requirement Documents) are processed through secure LLM endpoints and are not stored or used for models training unless opt-in parameters are set.
        </p>
        <h2 className="text-xl font-bold text-white pt-4">Data Retention</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Database schemas records (including user profiles, sprint histories, roadmaps, and chat transcripts) are preserved in local MongoDB stores and deleted immediately upon project archiving or deleting.
        </p>
      </main>
      <Footer />
    </div>
  );
}
