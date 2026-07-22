'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from '../../components/Providers';
import { Terminal, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@projectpilot.ai');
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      // Auto-submit simulation
      await login('demo@projectpilot.ai', 'password123');
    } catch (err: any) {
      setError('Demo account error. Please register a new user.');
    } finally {
      setLoading(false);
    }
  };
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const decoded: any = decodeJwt(response.credential);
      if (!decoded) {
        throw new Error('Failed to decode Google credential.');
      }
      await googleLogin({
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        avatar: decoded.picture
      });
    } catch (err: any) {
      setError('Google Sign-In failed.');
      setLoading(false);
    }
  };

  const initGoogleSignIn = () => {
    const g = (window as any).google;
    if (g) {
      g.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCredentialResponse,
      });
      setGoogleLoaded(true);
    }
  };

  React.useEffect(() => {
    const g = (window as any).google;
    if (g) {
      g.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCredentialResponse,
      });
      setGoogleLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    const g = (window as any).google;
    if (googleLoaded && g) {
      const btnParent = document.getElementById("google-signin-button");
      if (btnParent) {
        g.accounts.id.renderButton(
          btnParent,
          { 
            theme: "filled_black", 
            size: "large", 
            width: 190,
            text: "signin_with",
            shape: "rectangular"
          }
        );
      }
    }
  }, [googleLoaded]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="lazyOnload" 
        onLoad={initGoogleSignIn}
      />
      <div className="w-full max-w-md space-y-8 p-8 rounded-xl border border-zinc-200/10 bg-zinc-900/40 glass-panel">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <Terminal className="h-6 w-6 text-indigo-500" />
            <span>ProjectPilot <span className="text-indigo-500">AI</span></span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white">Sign in to your account</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg border border-red-500/15 bg-red-950/10 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input 
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input 
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200/10 bg-zinc-950 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/10 text-sm disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-zinc-500 text-xs font-semibold uppercase">Or continue with</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="w-full flex justify-center">
            {googleLoaded ? (
              <div id="google-signin-button" className="w-full"></div>
            ) : (
              <button 
                disabled
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-950 border border-zinc-200/10 opacity-50 font-semibold text-sm text-white"
              >
                Loading Google...
              </button>
            )}
          </div>
          <button 
            onClick={handleDemoLogin}
            type="button"
            className="w-full py-2.5 rounded-lg bg-indigo-650/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/10 transition-all font-semibold text-sm cursor-pointer"
          >
            Demo Login
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}
