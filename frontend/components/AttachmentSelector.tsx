'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  createdAt: string;
  bm25indexStatus?: string;
  metadata?: {
    processed?: boolean;
    chunkCount?: number;
  };
}

interface AttachmentSelectorProps {
  sessionId: string;
  attachments: Attachment[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
  flashTrigger?: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentSelector({
  attachments,
  selectedIds,
  onSelectionChange,
  isLoading,
  flashTrigger,
}: AttachmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (flashTrigger && flashTrigger > 0) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flashTrigger]);

  const processedAttachments = attachments.filter((att) => att.metadata?.processed);

  const toggleAttachment = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    onSelectionChange(processedAttachments.map((att) => att.id));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isLoading} 
          className={cn(
            "h-8 text-xs",
            isFlashing && "ring-2 ring-foreground/20"
          )}
        >
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Files ({selectedIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Select Context</DialogTitle>
          <DialogDescription className="text-sm">
            Choose files to include in your query
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={selectAll}
              disabled={processedAttachments.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={clearAll}
              disabled={selectedIds.length === 0}
            >
              Clear
            </Button>
          </div>

          {processedAttachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No documents available
            </div>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-1">
                {processedAttachments.map((attachment) => {
                  const isSelected = selectedIds.includes(attachment.id);
                  return (
                    <div
                      key={attachment.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
                        isSelected ? "bg-muted" : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleAttachment(attachment.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleAttachment(attachment.id)}
                        className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(attachment.size)}
                          {attachment.metadata?.chunkCount && (
                            <> • {attachment.metadata.chunkCount} chunks</>
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-foreground flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
