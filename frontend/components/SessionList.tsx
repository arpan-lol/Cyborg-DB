'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConversations, useCreateConversation, useDeleteConversation, useUpdateConversationTitle } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, MessageSquare, Loader2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SessionList() {
  const router = useRouter();
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { data: conversations, isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const updateTitle = useUpdateConversationTitle();

  const handleCreateConversation = async () => {
    try {
      const result = await createConversation.mutateAsync(newConversationTitle || undefined);
      setNewConversationTitle('');
      if (result?.sessionId) {
        router.push(`/dashboard/sessions/${result.sessionId}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleEditTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConversationId(sessionId);
    setEditingTitle(currentTitle || '');
  };

  const handleSaveTitle = async (sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!editingTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    try {
      await updateTitle.mutateAsync({ sessionId, title: editingTitle.trim() });
      setEditingConversationId(null);
      setEditingTitle('');
      toast.success('Title updated');
    } catch (error) {
      toast.error('Failed to update title');
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingConversationId(null);
    setEditingTitle('');
  };

  const handleDeleteConversation = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    try {
      await deleteConversation.mutateAsync(conversationToDelete);
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Conversation */}
      <div className="flex gap-3">
        <Input
          placeholder="New conversation title (optional)"
          value={newConversationTitle}
          onChange={(e) => setNewConversationTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
          className="h-10"
        />
        <Button 
          onClick={handleCreateConversation} 
          disabled={createConversation.isPending}
          className="h-10 px-4"
        >
          {createConversation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Conversations */}
      <div className="space-y-2">
        {conversations?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Create one to get started</p>
          </div>
        ) : (
          conversations?.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => router.push(`/dashboard/sessions/${conversation.id}`)}
              className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                {editingConversationId === conversation.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(conversation.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-8"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleSaveTitle(conversation.id, e)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium truncate">
                      {conversation.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>

              {editingConversationId !== conversation.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleEditTitle(conversation.id, conversation.title || '', e)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
