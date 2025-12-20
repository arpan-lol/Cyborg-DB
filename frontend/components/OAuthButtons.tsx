'use client';

import { Button } from './ui/button';
import { useGoogleAuth } from '@/hooks/use-auth';
import { AlertCircle } from 'lucide-react';

export const OAuthButtons = () => {
  const { initiateGoogleAuth, googleOAuthEnabled, isLoading } = useGoogleAuth();

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer"
        onClick={initiateGoogleAuth}
        disabled={!googleOAuthEnabled || isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="mr-2 h-4 w-4"
        >
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Continue with Google
      </Button>
      {!isLoading && !googleOAuthEnabled && (
        <div className="flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Google OAuth not configured</p>
            <p className="text-xs opacity-90">
              Create a Google OAuth client at{' '}
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Google Cloud Console
              </a>
              {' '}and save the credentials JSON as{' '}
              <code className="bg-yellow-500/20 px-1 rounded">google-creds.json</code>
              {' '}in the backend directory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
