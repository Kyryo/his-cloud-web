"use client";

import { Loader2 } from "lucide-react";

import { DestructiveButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteBlogPost } from "@/features/platform-admin/hooks/use-blog-cms";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

type BlogDeletePostDialogProps = {
  post: BlogPost | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export function BlogDeletePostDialog({ post, onOpenChange, onDeleted }: BlogDeletePostDialogProps) {
  const { toast } = useToast();
  const deletePost = useDeleteBlogPost();

  async function handleDelete() {
    if (!post) {
      return;
    }
    try {
      await deletePost.mutateAsync(post.id);
      toast({ variant: "success", title: "Post deleted" });
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <Dialog open={post !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>
            “{post?.title}” will be removed from the admin and the public blog. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)} disabled={deletePost.isPending}>
            Cancel
          </SecondaryButton>
          <DestructiveButton type="button" onClick={() => void handleDelete()} disabled={deletePost.isPending}>
            {deletePost.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Delete post
          </DestructiveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
