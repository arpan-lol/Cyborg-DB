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
      setGuestError('Guest login failed. Please try again.');
    } catch (error) {
      console.error('Guest login failed:', error);
      setGuestError('Network error. Please check your connection.');
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <OAuthButtons />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={loadingGuest}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingGuest ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <User className="w-4 h-4" />
        )}
        {loadingGuest ? 'Signing in...' : 'Continue as Guest'}
      </button>

      {guestError && (
        <p className="text-sm text-destructive text-center">{guestError}</p>
      )}
    </div>
  );
}
