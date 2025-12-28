'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { OAuthButtons } from './OAuthButtons';
import { Loader2, User } from 'lucide-react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const handleGuestLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loadingGuest) return;
    setLoadingGuest(true);
    setGuestError(null);
    try {
      const response = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.success) {
        window.location.href = '/dashboard/sessions';
        return;
      }
      setGuestError('Access denied. Please try again.');
    } catch (error) {
      console.error('Guest login failed:', error);
      setGuestError('Connection error. Check your network.');
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <OAuthButtons />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-4" style={{ backgroundColor: '#0a0a0a', color: 'rgba(255,255,255,0.3)' }}>or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={loadingGuest}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fafafa'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
      >
        {loadingGuest ? (
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#fafafa' }} />
        ) : (
          <User className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
        )}
        <span style={{ color: '#fafafa' }}>{loadingGuest ? 'Signing in...' : 'Continue as Guest'}</span>
      </button>

      {guestError && (
        <p className="text-sm text-center" style={{ color: '#ef4444' }}>{guestError}</p>
      )}
    </div>
  );
}
