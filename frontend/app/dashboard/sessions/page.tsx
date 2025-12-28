'use client';

import SessionList from '@/components/SessionList';
import { useAuth } from '@/hooks/use-auth';

export default function SessionsPage() {
  const { data: user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex-1 overflow-auto relative">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-4">
            SECURE WORKSPACE
          </p>
          <h1 className="text-2xl sm:text-3xl font-light mb-3">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a session or create a new one to begin working with your documents.
          </p>
        </div>
        <SessionList />
      </div>
    </div>
  );
}
