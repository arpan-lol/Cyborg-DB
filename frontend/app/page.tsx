'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Animated cipher text effect
function CipherText({ text, className }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iteration) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      iteration += 1/3;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
}

// Animated grid with moving particles
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="opacity-30">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1"/>
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#fade)"/>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)"/>
      </svg>
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </div>
  );
}

// 3D Cube wireframe animation
function WireframeCube() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-28 h-28 animate-[spin_20s_linear_infinite]">
        <defs>
          <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.15"/>
          </linearGradient>
          <filter id="cubeGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#cubeGlow)">
          {/* Front face */}
          <path d="M25 35 L75 35 L75 85 L25 85 Z" fill="none" stroke="url(#cubeGrad)" strokeWidth="1"/>
          {/* Back face */}
          <path d="M35 25 L85 25 L85 75 L35 75 Z" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
          {/* Connecting lines */}
          <line x1="25" y1="35" x2="35" y2="25" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
          <line x1="75" y1="35" x2="85" y2="25" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
          <line x1="75" y1="85" x2="85" y2="75" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
          <line x1="25" y1="85" x2="35" y2="75" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
          {/* Inner structure */}
          <circle cx="50" cy="55" r="10" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
          <circle cx="50" cy="55" r="4" fill="white" fillOpacity="0.25"/>
        </g>
      </svg>
    </div>
  );
}

// Encryption visualization - data flowing through nodes
function EncryptionFlow() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </linearGradient>
        <filter id="glowGreen">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      
      {/* Flow lines */}
      <path d="M0 60 Q50 40, 100 60 T200 60" fill="none" stroke="url(#flowGrad)" strokeWidth="2">
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M0 60 Q50 40, 100 60 T200 60" fill="none" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 8"/>
      
      {/* Nodes */}
      <g filter="url(#glowGreen)">
        <circle cx="30" cy="60" r="8" fill="none" stroke="#10b981" strokeOpacity="0.6" strokeWidth="1.5"/>
        <circle cx="30" cy="60" r="3" fill="#10b981" fillOpacity="0.5"/>
      </g>
      <g filter="url(#glowGreen)">
        <circle cx="100" cy="60" r="12" fill="none" stroke="#10b981" strokeOpacity="0.7" strokeWidth="1.5"/>
        <circle cx="100" cy="60" r="5" fill="#10b981" fillOpacity="0.4"/>
        {/* Lock icon in center */}
        <rect x="94" y="56" width="12" height="9" rx="1" fill="none" stroke="#10b981" strokeOpacity="0.9" strokeWidth="1"/>
        <path d="M97 56v-3a3 3 0 016 0v3" fill="none" stroke="#10b981" strokeOpacity="0.9" strokeWidth="1"/>
      </g>
      <g filter="url(#glowGreen)">
        <circle cx="170" cy="60" r="8" fill="none" stroke="#10b981" strokeOpacity="0.6" strokeWidth="1.5"/>
        <circle cx="170" cy="60" r="3" fill="#10b981" fillOpacity="0.5"/>
      </g>
      
      {/* Data bits flowing */}
      <circle r="2.5" fill="#10b981" fillOpacity="0.9" filter="url(#glowGreen)">
        <animateMotion dur="2s" repeatCount="indefinite" path="M0 60 Q50 40, 100 60 T200 60"/>
      </circle>
      <circle r="1.5" fill="#10b981" fillOpacity="0.6">
        <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M0 60 Q50 40, 100 60 T200 60"/>
      </circle>
    </svg>
  );
}

// Document search visualization
function SearchVisualization() {
  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        <filter id="docGlowWhite">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      
      {/* Documents stack */}
      <g opacity="0.7">
        <rect x="15" y="25" width="40" height="55" rx="2" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
        <rect x="10" y="20" width="40" height="55" rx="2" fill="#0a0a0c" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
        <rect x="5" y="15" width="40" height="55" rx="2" fill="#0c0c0e" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
        {/* Text lines */}
        <line x1="12" y1="28" x2="35" y2="28" stroke="white" strokeOpacity="0.2" strokeWidth="2"/>
        <line x1="12" y1="36" x2="30" y2="36" stroke="white" strokeOpacity="0.15" strokeWidth="2"/>
        <line x1="12" y1="44" x2="33" y2="44" stroke="white" strokeOpacity="0.1" strokeWidth="2"/>
      </g>
      
      {/* Search magnifier */}
      <g filter="url(#docGlowWhite)" className="animate-pulse" style={{animationDuration: '2s'}}>
        <circle cx="85" cy="45" r="16" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
        <line x1="96" y1="56" x2="108" y2="68" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
        {/* Scan lines inside */}
        <line x1="76" y1="40" x2="94" y2="40" stroke="white" strokeOpacity="0.3" strokeWidth="1">
          <animate attributeName="y1" values="35;55;35" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="35;55;35" dur="1.5s" repeatCount="indefinite"/>
        </line>
        <circle cx="85" cy="45" r="4" fill="white" fillOpacity="0.2"/>
      </g>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#08080a] text-[#fafafa] min-h-screen">
      
      {/* Hero Section - Bento Style */}
      <section className="relative min-h-screen flex flex-col px-4 sm:px-6 py-6">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-white/[0.02] to-transparent rounded-full blur-[100px]" />
          <AnimatedGrid />
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wider">VEIL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hidden sm:block text-xs text-white/40 hover:text-white transition-colors tracking-wider">
              FEATURES
            </Link>
            <Link 
              href="/auth/login" 
              className="text-xs px-5 py-2.5 bg-white text-black hover:bg-white/90 transition-colors tracking-wider font-medium"
            >
              ENTER
            </Link>
          </div>
        </nav>

        {/* Hero Bento Grid */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Main hero card */}
          <div className="lg:col-span-8 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-10 flex flex-col justify-between min-h-[420px] lg:min-h-0">
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150px] bg-gradient-to-b from-white/[0.02] to-transparent" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" className="opacity-50">
                <defs>
                  <pattern id="heroGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#heroGrid)" />
              </svg>
            </div>
            
            <div className="relative flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase bg-white/[0.03] border border-white/10 text-white/60">
                For Investigative Journalists
              </span>
              <span className="inline-block px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase text-white/30 border border-white/[0.06]">
                Zero-knowledge Encryption
              </span>
            </div>
            
            <div className="relative">
              <h1 className="text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[0.95] tracking-tight mb-6">
                <CipherText text="Search everything." />
                <br />
                <span className="text-white/20">Expose nothing.</span>
              </h1>
              
              <p className="text-sm sm:text-base text-white/45 max-w-lg leading-relaxed mb-8">
                The Panama Papers had 11.5 million documents. It took 400 journalists 
                a year to manually search them. With encrypted RAG, search the entire 
                archive in seconds—without exposing your sources.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Link 
                  href="/auth/login" 
                  className="group flex items-center gap-3 px-6 py-3.5 bg-white text-black text-sm tracking-wide hover:bg-white/90 transition-all font-medium"
                >
                  START SEARCHING
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link 
                  href="#how" 
                  className="px-6 py-3.5 text-sm text-white/30 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all tracking-wide"
                >
                  How It Works
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
                    <path d="M7 1L2 3.5v3.5c0 3 2 5.5 5 6.5 3-1 5-3.5 5-6.5V3.5L7 1z" stroke="currentColor" strokeWidth="1"/>
                    <path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[10px] text-white/25 tracking-wide">Local LLM</span>
                </div>
                <div className="w-px h-3 bg-white/10"/>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
                    <rect x="2" y="6" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1"/>
                    <path d="M4 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  <span className="text-[10px] text-white/25 tracking-wide">Air-gapped</span>
                </div>
                <div className="w-px h-3 bg-white/10"/>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/30">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1"/>
                    <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[10px] text-white/25 tracking-wide">&lt;1s search</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side cards stack */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3">
            
            {/* Encryption Flow Card - Keep green */}
            <div className="col-span-2 lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-emerald-500/10 p-5 min-h-[180px] group hover:border-emerald-500/20 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <EncryptionFlow />
              </div>
              <div className="relative">
                <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20">
                  End-to-End Encrypted
                </span>
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <h4 className="text-base font-light mb-1 text-white/90">Zero-knowledge search</h4>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Query encrypted embeddings. Data never decrypted.
                </p>
              </div>
            </div>

            {/* Search Visualization Card - Monochrome */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-5 min-h-[160px] group hover:border-white/[0.12] transition-colors">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/[0.02] blur-3xl"/>
              <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-center">
                <SearchVisualization />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                  Semantic Search
                </span>
                <h4 className="text-sm font-light mt-3 mb-1 text-white/80">11.5M+ documents</h4>
                <p className="text-[11px] text-white/40">Searchable in seconds</p>
              </div>
            </div>

            {/* 3D Cube Card - Monochrome */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-5 min-h-[160px] group hover:border-white/[0.12] transition-colors">
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/[0.02] blur-3xl"/>
              <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-center">
                <WireframeCube />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                  Air-Gapped
                </span>
                <h4 className="text-sm font-light mt-3 mb-1 text-white/80">Offline mode</h4>
                <p className="text-[11px] text-white/40">Runs completely offline</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="how" className="relative py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            
            {/* The Problem Card */}
            <div className="md:col-span-6 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/[0.02] blur-3xl"/>
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                    The Problem
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-light mt-4 mb-4 text-white/90">Data leaks are life-or-death</h2>
                  <p className="text-white/50 leading-relaxed text-sm sm:text-base">
                    Daphne Caruana Galizia was assassinated after working on Panama Papers. 
                    Edward Snowden had to flee to Russia. If servers are seized or hacked, 
                    sources can be identified and killed.
                  </p>
                </div>
                {/* Danger visualization */}
                <div className="flex justify-center">
                  <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
                    <defs>
                      <filter id="dangerGlow">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <g filter="url(#dangerGlow)">
                      {/* Broken shield */}
                      <path d="M90 10L150 35V70C150 105 125 130 90 140" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="6 4"/>
                      <path d="M90 10L30 35V70C30 105 55 130 90 140" stroke="white" strokeOpacity="0.25" strokeWidth="1.5"/>
                      {/* Crack */}
                      <path d="M90 40L85 60L95 75L85 90L90 110" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"/>
                      {/* Warning */}
                      <circle cx="90" cy="70" r="15" stroke="white" strokeOpacity="0.2" strokeWidth="1.5"/>
                      <path d="M90 62v10M90 78v2" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload Phase Card */}
            <div className="md:col-span-4 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-8 min-h-[280px] group hover:border-white/[0.1] transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] blur-3xl"/>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                  Phase 01
                </span>
                <h3 className="text-xl sm:text-2xl font-light mt-4 mb-3 text-white/90">Whistleblower uploads</h3>
                <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                  Encrypted files dropped—PDFs, images, Word docs. System chunks and creates 
                  embeddings while data stays encrypted.
                </p>
              </div>
              
              {/* Document flow */}
              <div className="absolute right-4 sm:right-8 bottom-8 opacity-50 group-hover:opacity-70 transition-opacity">
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
                  <defs>
                    <filter id="docFlowGlow">
                      <feGaussianBlur stdDeviation="1.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect x="0" y="15" width="60" height="75" rx="3" fill="#0a0a0c" stroke="white" strokeOpacity="0.2"/>
                  <path d="M10 30h40M10 40h28M10 50h35" stroke="white" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round"/>
                  
                  <path d="M70 52 L95 52" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" markerEnd="url(#arrowWhite)"/>
                  <defs><marker id="arrowWhite" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                    <path d="M0 0L6 3L0 6" fill="none" stroke="white" strokeOpacity="0.3"/>
                  </marker></defs>
                  
                  <g filter="url(#docFlowGlow)">
                    <rect x="100" y="20" width="50" height="22" rx="2" stroke="white" strokeOpacity="0.2"/>
                    <rect x="100" y="47" width="50" height="22" rx="2" stroke="white" strokeOpacity="0.2"/>
                    <rect x="100" y="74" width="50" height="22" rx="2" stroke="white" strokeOpacity="0.2"/>
                    
                    <circle cx="125" cy="31" r="5" stroke="white" strokeOpacity="0.25"/>
                    <circle cx="125" cy="58" r="5" stroke="white" strokeOpacity="0.25"/>
                    <circle cx="125" cy="85" r="5" stroke="white" strokeOpacity="0.25"/>
                    <circle cx="125" cy="31" r="2" fill="white" fillOpacity="0.2"/>
                    <circle cx="125" cy="58" r="2" fill="white" fillOpacity="0.2"/>
                    <circle cx="125" cy="85" r="2" fill="white" fillOpacity="0.2"/>
                  </g>
                </svg>
              </div>
            </div>

            {/* Stats card */}
            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-8 flex flex-col justify-between min-h-[280px]">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.02] blur-3xl"/>
              <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08] w-fit">
                Panama Papers
              </span>
              <div className="relative">
                <span className="text-5xl sm:text-6xl font-extralight text-white/90">400<span className="text-xl text-white/30">+</span></span>
                <p className="text-sm text-white/50 mt-3">Journalists worked for a year</p>
                <div className="mt-4 flex gap-1">
                  {Array(12).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-white/10 rounded-full"/>
                  ))}
                </div>
                <p className="text-[11px] text-white/30 mt-2">Now searchable in seconds</p>
              </div>
            </div>

            {/* Search Phase Card */}
            <div className="md:col-span-3 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-8 min-h-[260px] group hover:border-white/[0.1] transition-colors">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.02] blur-3xl"/>
              <span className="relative inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                Phase 02
              </span>
              <h3 className="relative text-xl font-light mt-4 mb-3 text-white/90">Semantic search</h3>
              
              <div className="relative mt-4 p-4 bg-white/[0.02] border border-white/[0.06]">
                <p className="text-sm text-white/50 font-mono leading-relaxed">
                  &quot;Find all communications between Company X and offshore accounts...&quot;
                </p>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/40 animate-pulse"/>
              </div>
              
              {/* Search nodes */}
              <div className="absolute right-6 bottom-6 opacity-50 group-hover:opacity-70 transition-opacity">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
                  <defs>
                    <filter id="searchGlow">
                      <feGaussianBlur stdDeviation="1.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <g filter="url(#searchGlow)">
                    <circle cx="35" cy="35" r="20" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
                    <path d="M50 50L62 62" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="35" cy="35" r="8" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
                    <circle cx="35" cy="35" r="3" fill="white" fillOpacity="0.3"/>
                  </g>
                </svg>
              </div>
            </div>

            {/* Verify Phase Card */}
            <div className="md:col-span-3 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 sm:p-8 min-h-[260px] group hover:border-white/[0.1] transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl"/>
              <span className="relative inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                Phase 03
              </span>
              <h3 className="relative text-xl font-light mt-4 mb-3 text-white/90">Verify with citations</h3>
              <p className="relative text-sm text-white/50 leading-relaxed">
                Results link to exact pages. Open source documents in side panel.
              </p>
              
              {/* Citation results */}
              <div className="relative mt-6 space-y-2">
                {[
                  { title: 'Mossack_Fonseca_Email.pdf', page: 'p.47' },
                  { title: 'Offshore_Records.xlsx', page: 'row 892' },
                  { title: 'Board_Meeting.docx', page: 'p.12' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group/item">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"/>
                    <span className="text-[11px] text-white/40 font-mono truncate flex-1 group-hover/item:text-white/60 transition-colors">{item.title}</span>
                    <span className="text-[10px] text-white/30">{item.page}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zero Trust Card */}
            <div id="features" className="md:col-span-6 relative overflow-hidden bg-gradient-to-br from-[#0a0a0c] to-[#08080a] border border-white/[0.06] p-6 sm:p-10 min-h-[300px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/[0.02] blur-3xl"/>
              <div className="relative grid md:grid-cols-2 gap-8 sm:gap-12">
                <div>
                  <span className="inline-flex items-center gap-2 px-2 py-1 text-[10px] tracking-[0.15em] uppercase text-white/50 bg-white/[0.03] border border-white/[0.08]">
                    Zero Trust Architecture
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-light mt-4 mb-4 text-white/90">Source protection</h3>
                  <p className="text-white/50 leading-relaxed mb-8 text-sm sm:text-base">
                    Even if governments seize servers, hackers breach databases, or insiders 
                    steal data—they only get encrypted embeddings. Impossible to reverse-engineer.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Government seizure', 'Database breach', 'Insider theft'].map((t, i) => (
                      <span key={i} className="px-4 py-2 text-[10px] tracking-wider text-white/40 border border-white/[0.08] bg-white/[0.02]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Shield */}
                <div className="flex items-center justify-center">
                  <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                    <defs>
                      <filter id="shieldGlow">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.35"/>
                        <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                    <g filter="url(#shieldGlow)">
                      <path d="M90 15L160 45V90C160 140 130 165 90 175C50 165 20 140 20 90V45L90 15Z" stroke="url(#shieldGrad)" strokeWidth="1.5"/>
                      <path d="M90 35L140 55V90C140 125 118 145 90 152C62 145 40 125 40 90V55L90 35Z" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
                      <path d="M90 55L120 70V90C120 110 105 125 90 130C75 125 60 110 60 90V70L90 55Z" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
                      
                      <rect x="78" y="85" width="24" height="18" rx="2" stroke="white" strokeOpacity="0.35" strokeWidth="1.5"/>
                      <path d="M83 85V78a7 7 0 0114 0v7" stroke="white" strokeOpacity="0.35" strokeWidth="1.5"/>
                      <circle cx="90" cy="94" r="2.5" fill="white" fillOpacity="0.35"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 min-h-[160px] flex flex-col justify-between group hover:border-white/[0.1] transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-2xl"/>
              <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/50">
                  <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 12v2M15 12v2M3 15h4M13 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-light mb-1 text-white/90">Air-gapped</h4>
                <p className="text-[11px] text-white/50">Runs entirely offline. No network.</p>
              </div>
            </div>

            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 min-h-[160px] flex flex-col justify-between group hover:border-white/[0.1] transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-2xl"/>
              <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/50">
                  <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 8h6M7 10h6M7 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-light mb-1 text-white/90">Local LLM</h4>
                <p className="text-[11px] text-white/50">No OpenAI. No cloud. No subpoenas.</p>
              </div>
            </div>

            <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#08080a] border border-white/[0.06] p-6 min-h-[160px] flex flex-col justify-between group hover:border-white/[0.1] transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-2xl"/>
              <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/50">
                  <path d="M10 2L3 5.5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10v-5L10 2z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-light mb-1 text-white/90">Your keys only</h4>
                <p className="text-[11px] text-white/50">Keys never leave your device.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-gradient-radial from-white/[0.02] to-transparent rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-light mb-4 text-white/90">Protect sources. Expose truth.</h2>
          <p className="text-white/45 mb-10 text-sm sm:text-base">
            Investigative journalism shouldn't require choosing between efficiency and protection.
          </p>
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-4 bg-white text-[#0a0a0a] text-sm font-medium hover:bg-white/90 transition-all"
          >
            Start Searching
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 sm:px-6 py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white/20">
              <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-white/20">VEIL</span>
          </div>
          <span className="text-[11px] text-white/15">© {new Date().getFullYear()} — For investigative journalists</span>
        </div>
      </footer>

      <style jsx global>{`
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
