'use client';

import SessionList from '@/components/SessionList';
import { useAuth } from '@/hooks/use-auth';

export default function SessionsPage() {
  const { data: user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">
            Hello, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Select a conversation or create a new one to get started.
          </p>
        </div>
        <SessionList />
      </div>
    </div>
  );
}
