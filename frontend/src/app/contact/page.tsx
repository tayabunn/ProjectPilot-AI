'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && message.trim()) {
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">Contact Our Team</h1>
          <p className="text-zinc-400 max-w-md mx-auto text-sm">
            Have questions about ProjectPilot AI? Reach out, and our engineering managers will reply shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Get in Touch</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We are available for consultations on enterprise integrations, deployment setups, and custom models training.
            </p>

            <div className="space-y-4 pt-4 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>support@projectpilot.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel space-y-6">
            <h3 className="font-bold text-white text-base">Send a Message</h3>

            {success ? (
              <div className="p-6 text-center space-y-3 border border-emerald-500/15 bg-emerald-950/10 rounded-lg">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Message Sent Successfully!</h4>
                <p className="text-xs text-zinc-400">Thank you. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Work Email *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-400">Message / Request *</label>
                  <textarea 
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help your team?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-xs placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
