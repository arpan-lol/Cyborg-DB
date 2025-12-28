'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText, X, ArrowLeft, Trash2, Eye, Image, Table, File, Loader2 } from 'lucide-react';
import { EngineEvent, StreamStatus } from '@/lib/types';
import LogsPanel from './LogsPanel';
import ChunkViewer from './ChunkViewer';
import { Progress } from '@/components/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

const FileViewer = dynamic(() => import('./FileViewer'), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface Attachment {
  id: string;
  filename: string;
  type: string;
  url?: string;
  size: number;
  isTemporary?: boolean;
  mimeType?: string;
  metadata?: {
    processed?: boolean;
  };
}

interface FilePanelProps {
  attachments: Attachment[];
  selectedFile?: { filename: string; url: string; targetPage?: number; type?: string };
  onClose?: () => void;
  onDocumentClick?: (attachment: Attachment) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
  fileProcessingProgress?: Record<string, StreamStatus>;
  logs?: EngineEvent[];
  sessionId: string;
}

function getFileIcon(filename: string) {
  const ext = filename.toLowerCase().split('.').pop() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image className="h-4 w-4" />;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <Table className="h-4 w-4" />;
  if (ext === 'pdf') return <FileText className="h-4 w-4" />;
  if (['doc', 'docx'].includes(ext)) return <FileText className="h-4 w-4" />;
  if (['ppt', 'pptx'].includes(ext)) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePanel({ attachments, selectedFile, onClose, onDocumentClick, onDeleteAttachment, fileProcessingProgress, logs = [], sessionId }: FilePanelProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [chunkViewerOpen, setChunkViewerOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ id: string; filename: string } | null>(null);
  const logsPanelRef = useRef<ImperativePanelHandle>(null);
  const isDocumentOpen = !!selectedFile;

  useEffect(() => {
    if (selectedFile?.url) {
      setCurrentPage(selectedFile.targetPage || 1);
    }
  }, [selectedFile?.url, selectedFile?.targetPage]);

  const handleViewChunks = (attachment: Attachment) => {
    setSelectedAttachment({ id: attachment.id, filename: attachment.filename });
    setChunkViewerOpen(true);
  };

  const viewableAttachments = attachments.filter(
    (att) => att.metadata?.processed || att.isTemporary
  );

  useEffect(() => {
    if (logsPanelRef.current) {
      logsPanelRef.current.resize(isDocumentOpen ? 4 : 30);
    }
  }, [isDocumentOpen]);

  // File viewer is open
  if (selectedFile) {
    return (
      <div className="h-full">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel defaultSize={70} className="flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="flex-1 text-sm font-medium truncate">{selectedFile.filename}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* File viewer */}
            <div className="flex-1 overflow-hidden p-2">
              <FileViewer
                fileUrl={selectedFile.url}
                filename={selectedFile.filename}
                fileType={selectedFile.type || ''}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel 
            ref={logsPanelRef}
            defaultSize={30}
            minSize={10}
            maxSize={70}
            collapsible={true}
            collapsedSize={4}
          >
            <LogsPanel logs={logs} sessionId={sessionId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  // File list view
  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={70} className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">
              Files {viewableAttachments.length > 0 && `(${viewableAttachments.length})`}
            </h2>
          </div>

          {/* File list */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {viewableAttachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm">No files uploaded</p>
                </div>
              ) : (
                viewableAttachments.map((att) => {
                  const fileProgress = fileProcessingProgress?.[att.id];
                  const isProcessing = fileProgress?.status === 'processing' || fileProgress?.status === 'connected';
                  const progressValue = isProcessing ? fileProgress?.progress : undefined;

                  return (
                    <div
                      key={att.id}
                      onClick={() => !att.isTemporary && onDocumentClick?.(att)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border border-border",
                        "hover:bg-muted/50 transition-colors",
                        !att.isTemporary && "cursor-pointer",
                        att.isTemporary && "opacity-60"
                      )}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                        {getFileIcon(att.filename)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" title={att.filename}>
                          {att.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(att.size)}
                          {att.isTemporary && ' • Uploading...'}
                        </p>
                        {progressValue !== undefined && (
                          <Progress value={progressValue} className="h-1 mt-2" />
                        )}
                      </div>

                      {!att.isTemporary && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewChunks(att);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAttachment?.(att.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel 
          ref={logsPanelRef}
          defaultSize={30}
          minSize={10}
          maxSize={70}
          collapsible={true}
          collapsedSize={4}
        >
          <LogsPanel logs={logs} sessionId={sessionId} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {selectedAttachment && (
        <ChunkViewer
          open={chunkViewerOpen}
          onOpenChange={setChunkViewerOpen}
          sessionId={sessionId}
          attachmentId={selectedAttachment.id}
          filename={selectedAttachment.filename}
        />
      )}
    </div>
  );
}
