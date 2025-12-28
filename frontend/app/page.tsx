'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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

// Scanning line effect
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute w-full h-px bg-gradient-to-r from-transparent via-neutral-400/50 to-transparent animate-scan"
      />
    </div>
  );
}

// Noise texture overlay
function NoiseOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-[#fafafa] min-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <NoiseOverlay />
      
      {/* Hero - Full viewport */}
      <section className="relative h-screen flex flex-col">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          
          {/* Grid lines - visible */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Radial glow from top center */}
          <div 
            className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
            }}
          />
          
          {/* Side glows */}
          <div 
            className="absolute top-1/4 -left-[100px] w-[400px] h-[400px]"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)',
            }}
          />
          <div 
            className="absolute top-1/2 -right-[100px] w-[350px] h-[350px]"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
            }}
          />
          
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
        
        {/* Nav */}
        <nav className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold tracking-wider">VEIL</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-xs text-white/50 hover:text-white transition-colors tracking-wide">
              FEATURES
            </Link>
            <Link 
              href="/auth/login" 
              className="text-xs px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors tracking-wide"
            >
              ENTER
            </Link>
          </div>
        </nav>

        {/* Hero content - centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.9] tracking-tight mb-8">
            <CipherText text="Search everything." />
            <br />
            <span className="text-white/30">Expose nothing.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-white/50 max-w-md mb-12 leading-relaxed">
            Semantic search across millions of documents while keeping 
            everything encrypted. Your sources stay protected.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/auth/login" 
              className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm tracking-wide hover:bg-white/90 transition-all"
            >
              START NOW
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link 
              href="#how" 
              className="text-xs text-white/40 hover:text-white transition-colors tracking-wide"
            >
              SEE HOW IT WORKS ↓
            </Link>
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/20" />
        </div>
        
        <ScanLine />
      </section>

      {/* How it works */}
      <section id="how" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 max-w-xl">
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-4 leading-tight">
              Search in seconds.<br />
              <span className="text-white/30">Not months.</span>
            </h2>
          </div>

          {/* Process steps */}
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {[
              {
                num: '01',
                title: 'Upload',
                desc: 'Drop encrypted files. PDFs, docs, spreadsheets. Our system chunks and embeds while encrypted.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                )
              },
              {
                num: '02', 
                title: 'Ask',
                desc: '"Show all communications between Company X and offshore accounts in 2023." Natural language queries.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                )
              },
              {
                num: '03',
                title: 'Verify',
                desc: 'Results with exact citations. Click to open source documents. Everything stays encrypted.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                )
              }
            ].map((step, i) => (
              <div key={i} className="bg-[#0a0a0a] p-8 sm:p-12 group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs text-white/20 font-mono">{step.num}</span>
                  <div className="text-white/30 group-hover:text-white/60 transition-colors">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-light mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="relative py-32 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center">
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Zero trust architecture</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-4">
              Protected. Always.
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 lg:col-span-2 p-8 sm:p-12 border border-white/10 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <h3 className="text-2xl font-light mb-4">Source protection</h3>
                  <p className="text-white/40 max-w-md leading-relaxed">
                    Even if servers are seized, databases breached, or insiders try to steal—
                    they only get encrypted embeddings. Can't reverse-engineer to find source identities.
                  </p>
                </div>
                <div className="mt-12 flex gap-3">
                  {['Server seized', 'Database breached', 'Insider theft'].map((threat, i) => (
                    <span key={i} className="px-3 py-1.5 text-[10px] tracking-wider uppercase border border-white/10 rounded-full text-white/40">
                      {threat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small cards */}
            <div className="p-8 border border-white/10 rounded-2xl">
              <svg className="w-8 h-8 text-white/30 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <h4 className="text-lg font-light mb-2">Local LLM</h4>
              <p className="text-sm text-white/40">No OpenAI. No cloud. No one to subpoena.</p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl">
              <svg className="w-8 h-8 text-white/30 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <h4 className="text-lg font-light mb-2">Your keys only</h4>
              <p className="text-sm text-white/40">Encryption keys never leave your device.</p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl">
              <svg className="w-8 h-8 text-white/30 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8"/>
              </svg>
              <h4 className="text-lg font-light mb-2">Any document</h4>
              <p className="text-sm text-white/40">PDF, Word, Excel, images. All supported.</p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl">
              <svg className="w-8 h-8 text-white/30 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <h4 className="text-lg font-light mb-2">Instant results</h4>
              <p className="text-sm text-white/40">Semantic search in under a second.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed text-white/80">
            "Investigative journalism shouldn't require choosing between 
            <span className="text-white"> efficiency</span> and 
            <span className="text-white"> source protection</span>."
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 border-t border-white/10">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-6">
            Ready to start?
          </h2>
          <p className="text-white/40 mb-10">
            Protect your sources. Expose the truth.
          </p>
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full text-sm tracking-wide hover:bg-white/90 transition-all"
          >
            GET STARTED FREE
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white/60">
              <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-white/40 tracking-wide">VEIL</span>
          </div>
          <span className="text-[10px] text-white/30 tracking-wide">
            © {new Date().getFullYear()} — PROTECTING SOURCES, EXPOSING TRUTH
          </span>
        </div>
      </footer>

      <style jsx global>{`
        /* Hide scrollbar but allow scrolling */
        html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar {
          display: none;
        }
        body {
          overflow-y: scroll;
        }
        
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
