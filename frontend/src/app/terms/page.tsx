'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 space-y-6">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-zinc-500 text-xs">Last updated: July 20, 2026</p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          By utilizing ProjectPilot AI (an AI Engineering Manager workspace), you agree to our standard service parameters. You retain ownership of uploaded requirements and parsed codes.
        </p>
        <h2 className="text-xl font-bold text-white pt-4">Workspace Autonomy Limits</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          While our agents provide automated code scans and recommendations, they do not replace human code audits. The sandbox should be reviewed by senior engineers before pushing to production servers.
        </p>
      </main>
      <Footer />
    </div>
  );
}
