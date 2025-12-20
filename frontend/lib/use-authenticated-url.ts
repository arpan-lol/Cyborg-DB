import { useState, useEffect } from 'react';
import { fetchWithAuth } from './fetch-utils';

export function useAuthenticatedUrl(fileUrl: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth(fileUrl);
        if (!response.ok) throw new Error('Failed to load file');
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error('[useAuthenticatedUrl] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl]);

  return { blobUrl, loading, error };
}
