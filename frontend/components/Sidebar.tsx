'use client';

import { PanelLeftClose } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ConversationsList } from './sidebar/ConversationsList';

import { NavUser } from '@/components/NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversationTitle,
} from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state } = useSidebar();
  const { data: authUser } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const updateTitle = useUpdateConversationTitle();
  const router = useRouter();
  const pathname = usePathname();
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>();

  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || 'User',
        email: authUser.email,
        avatar: authUser.picture || '',
      });
    }
  }, [authUser]);

  const handleCreateConversation = async () => {
    try {
      const result = await createConversation.mutateAsync(undefined);
      if (result?.sessionId) {
        router.push(`/dashboard/sessions/${result.sessionId}`);
      } else {
        console.error('Session creation failed: No sessionId returned', result);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleEditTitle = (conversationId: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle || '');
  };

  const handleSaveTitle = async (conversationId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!editingTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    try {
      await updateTitle.mutateAsync({ sessionId: conversationId, title: editingTitle.trim() });
      setEditingConversationId(null);
      setEditingTitle('');
      toast.success('Title updated successfully');
    } catch (error) {
      console.error('Failed to update title:', error);
      toast.error('Failed to update title. Please try again.');
    }
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setEditingConversationId(null);
    setEditingTitle('');
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation.mutateAsync(conversationToDelete);
      toast.success('Conversation deleted successfully');
      if (sessionId === conversationToDelete) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const sessionId = pathname?.match(/\/dashboard\/sessions\/([^\/]+)/)?.[1];

  return (
    <>
      {state === 'collapsed' && (
        <div className="fixed left-2 top-3 z-50 hidden md:flex">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between w-full px-1.5">
                <a href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Flux AI"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <span className="text-base font-semibold">Flux AI</span>
                </a>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleSidebar}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <ConversationsList
            conversations={conversations || []}
            isLoading={isLoading}
            editingConversationId={editingConversationId}
            editingTitle={editingTitle}
            onCreateConversation={handleCreateConversation}
            onEditStart={handleEditTitle}
            onEditSave={handleSaveTitle}
            onEditCancel={handleCancelEdit}
            onEditChange={setEditingTitle}
            onDelete={(conversationId, e) => {
              e.preventDefault();
              e.stopPropagation();
              setConversationToDelete(conversationId);
              setDeleteDialogOpen(true);
            }}
            isCreating={createConversation.isPending}
            isDeleting={deleteConversation.isPending}
          />
        </SidebarContent>

        {user && (
          <SidebarFooter>
            <NavUser user={user} />
          </SidebarFooter>
        )}
      </Sidebar>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed.
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
    </>
  );
}
