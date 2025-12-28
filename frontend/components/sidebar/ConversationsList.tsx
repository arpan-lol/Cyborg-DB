'use client';

import { Plus, Loader2 } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface ConversationsListProps {
  conversations: any[];
  isLoading: boolean;
  editingConversationId: string | null;
  editingTitle: string;
  onCreateConversation: () => void;
  onEditStart: (id: string, title: string, e: React.MouseEvent) => void;
  onEditSave: (id: string, e?: React.MouseEvent) => void;
  onEditCancel: (e?: React.MouseEvent) => void;
  onEditChange: (value: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isCreating: boolean;
  isDeleting: boolean;
}

export function ConversationsList({
  conversations,
  isLoading,
  editingConversationId,
  editingTitle,
  onCreateConversation,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditChange,
  onDelete,
  isCreating,
  isDeleting,
}: ConversationsListProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between px-0">
        <span className="text-xs">Sessions</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onCreateConversation}
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {conversations?.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isEditing={editingConversationId === conversation.id}
              editingTitle={editingTitle}
              onEditStart={onEditStart}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
              onEditChange={onEditChange}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
          {!isLoading && conversations?.length === 0 && (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No sessions
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
