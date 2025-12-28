'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { EngineEvent } from '@/lib/types';
import { CheckCircle2, Info, AlertCircle, ExternalLink, Activity } from 'lucide-react';
import ChunkViewer from './ChunkViewer';
import { cn } from '@/lib/utils';

interface LogsPanelProps {
  logs: EngineEvent[];
  isDocumentOpen: boolean;
  sessionId: string;
}

export default function LogsPanel({ logs, isDocumentOpen, sessionId }: LogsPanelProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [chunkViewerOpen, setChunkViewerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EngineEvent | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleViewChunks = (log: EngineEvent) => {
    setSelectedLog(log);
    setChunkViewerOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Info className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-t border-border">
      {/* Header */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Logs</span>
      </div>

      {/* Log entries */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span className="text-xs">No activity yet</span>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className={cn(
                  "flex items-start gap-2 px-2 py-1.5 rounded text-xs",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate">{log.message}</span>
                    {log.actionType === 'view-chunks' && log.attachmentId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 flex-shrink-0"
                        onClick={() => handleViewChunks(log)}
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                  {log.data?.title && (
                    <p className="text-muted-foreground mt-0.5">{log.data.title}</p>
                  )}
                  {log.data?.body && log.data.body.length > 0 && (
                    <ul className="text-muted-foreground mt-0.5 ml-2 space-y-0.5">
                      {log.data.body.map((item, i) => (
                        <li key={i} className="text-[10px]">• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground font-mono">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </ScrollArea>

      {selectedLog && selectedLog.attachmentId && (
        <ChunkViewer
          open={chunkViewerOpen}
          onOpenChange={setChunkViewerOpen}
          sessionId={sessionId}
          attachmentId={selectedLog.attachmentId}
        />
      )}
    </div>
  );
}
