 'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OAuthButtons } from './OAuthButtons';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter();
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to Flux AI</CardTitle>
          <CardDescription>
            Sign in to access your AI-powered document assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <OAuthButtons />
          </div>
          <CardDescription className="text-center mt-4">
            or,{' '}
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (loadingGuest) return;
                setLoadingGuest(true);
                setGuestError(null);
                try {
                  console.log('[Guest] calling frontend API route /api/auth/guest');
                  const response = await fetch('/api/auth/guest', { method: 'POST' });
                  const data = await response.json().catch(() => null);
                  console.log('[Guest] response', response.status, data);
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
              }}
              className="underline cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              {loadingGuest ? 'Logging in…' : 'login as a guest'}
              <span className="inline-block">→</span>
            </button>
            {guestError && (
              <p className="text-sm text-red-500 mt-2">{guestError}</p>
            )}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
