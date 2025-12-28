'use client';

import { useState, memo } from 'react';
import { Loader2, Copy, Check, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatMessageTime, formatMessageDateTime, getDateTimeAttribute } from '@/lib/date-utils';
import { areAttachmentsEqual } from '@/lib/message-utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StreamingMessageContent } from '@/components/StreamingMessageContent';
import { AttachmentList } from '@/components/AttachmentList';
import 'highlight.js/styles/github-dark.css';

interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
  userName?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  isComplete?: boolean;
  isNewMessage?: boolean;
  onCitationClick?: (filename: string, page?: number) => void;
  onAttachmentClick?: (filename: string) => void;
}

function VeilMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-background">
      <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChatMessageComponent({ message, userAvatar, userName, isLoading, isStreaming = false, isComplete = false, isNewMessage = false, onCitationClick, onAttachmentClick }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    if (!message?.content) {
      toast.error('No content to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      toast.error('Failed to copy');
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  const hasValidDate = message?.createdAt && !isNaN(new Date(message.createdAt).getTime());

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isNewMessage && 'animate-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAvatar} alt={userName || 'User'} />
            <AvatarFallback className="text-xs bg-muted">
              {userName?.charAt(0).toUpperCase() || <User className="h-3.5 w-3.5" />}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-foreground border border-border flex items-center justify-center">
            <VeilMark />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser && 'items-end')}>
        {isUser ? (
          // User message
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-foreground text-background">
            <div className="text-sm whitespace-pre-wrap break-words">
              {message?.content || <span className="italic opacity-60">No content</span>}
            </div>
            <AttachmentList attachments={message.attachments} onAttachmentClick={onAttachmentClick} />
          </div>
        ) : (
          // Assistant message
          <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-muted/60 border border-border/50">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-1">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            ) : (
              <ErrorBoundary>
                <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm">
                  <StreamingMessageContent 
                    content={message.content} 
                    isStreaming={isStreaming}
                    isComplete={isComplete}
                    onCitationClick={onCitationClick} 
                  />
                </div>
              </ErrorBoundary>
            )}
          </div>
        )}

        {/* Timestamp and actions */}
        {hasValidDate && (
          <div className={cn('flex items-center gap-2 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {!isUser && !isLoading && message?.content && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copyError ? (
                  <AlertCircle className="h-3 w-3" />
                ) : copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
            <time
              className="text-[11px] text-muted-foreground"
              dateTime={getDateTimeAttribute(message.createdAt)}
              title={formatMessageDateTime(message.createdAt)}
            >
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
        )}
      </div>
    </div>
  );
}

const ChatMessage = memo(ChatMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message?.id === nextProps.message?.id &&
    prevProps.message?.content === nextProps.message?.content &&
    prevProps.message?.createdAt === nextProps.message?.createdAt &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.isNewMessage === nextProps.isNewMessage &&
    prevProps.userAvatar === nextProps.userAvatar &&
    prevProps.userName === nextProps.userName &&
    prevProps.onCitationClick === nextProps.onCitationClick &&
    prevProps.onAttachmentClick === nextProps.onAttachmentClick &&
    areAttachmentsEqual(prevProps.message?.attachments, nextProps.message?.attachments)
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
