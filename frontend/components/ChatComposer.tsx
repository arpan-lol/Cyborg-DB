'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatComposerProps {
  onSend: (content: string) => void;
  onAttachmentClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
}

export default function ChatComposer({
  onSend,
  onAttachmentClick,
  disabled = false,
  placeholder = 'Ask a question...',
  loading = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 160) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="relative flex items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
        <button
          type="button"
          onClick={onAttachmentClick}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent",
            "text-sm leading-6 outline-none",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "py-1.5 px-1 min-h-[32px] max-h-[160px]"
          )}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            "flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg",
            "transition-all",
            message.trim() && !disabled
              ? "bg-foreground text-background hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="hidden sm:block text-[10px] text-muted-foreground text-center mt-2 opacity-50">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
