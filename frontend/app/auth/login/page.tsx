'use client'

import { LoginForm } from '@/components/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a', color: '#fafafa' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-[#0a0a0a] to-[#050505]" />
        
        {/* Radial orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-[80px]" />
        
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity" style={{ color: '#fafafa' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-semibold tracking-wider">VEIL</span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-3" style={{ color: '#fafafa' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sign in to access your encrypted workspace
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#fafafa' }}>Zero-knowledge encryption</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Your documents are encrypted locally before upload. We never see your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 p-4 sm:p-6 text-center">
        <p className="text-[10px] tracking-wide" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} VEIL — PROTECTING SOURCES, EXPOSING TRUTH
        </p>
      </footer>
    </div>
  );
}
