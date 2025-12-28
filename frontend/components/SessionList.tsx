'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConversations, useCreateConversation, useDeleteConversation, useUpdateConversationTitle } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, FileText, Loader2, Pencil, Check, X } from 'lucide-react';
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
      console.error('Failed to create session:', error);
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
    } catch {
      toast.error('Failed to rename');
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
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Session */}
      <div className="flex gap-2">
        <Input
          placeholder="Session name (optional)"
          value={newConversationTitle}
          onChange={(e) => setNewConversationTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
          className="h-11 rounded-lg"
        />
        <Button 
          onClick={handleCreateConversation} 
          disabled={createConversation.isPending}
          className="h-11 px-5 rounded-lg"
        >
          {createConversation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sessions */}
      <div className="space-y-1">
        {conversations?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-6 w-6 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No sessions</p>
          </div>
        ) : (
          conversations?.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => router.push(`/dashboard/sessions/${conversation.id}`)}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                {editingConversationId === conversation.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(conversation.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleSaveTitle(conversation.id, e)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm truncate">{conversation.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </>
                )}
              </div>

              {editingConversationId !== conversation.id && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEditTitle(conversation.id, conversation.title || '', e)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={(e) => handleDeleteConversation(conversation.id, e)}>
                    <Trash2 className="h-3 w-3" />
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
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this session and all documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteConversation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
