"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogEditorStatusBar } from "@/features/platform-admin/components/blog/BlogEditorStatusBar";
import { useSaveBlogPost } from "@/features/platform-admin/hooks/use-blog-cms";
import { toBlogPostInput } from "@/features/platform-admin/schemas/blog-post.schema";
import { uploadBlogImage } from "@/features/platform-admin/services/blog-cms.service";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import type { QuillOp, QuillToTipTapResult } from "@/features/platform-admin/types/quill-delta.types";
import { quillDeltaToTiptap } from "@/features/platform-admin/utils/quillDeltaToTiptap";
import { hasTipTapContent, tiptapToQuillDelta } from "@/features/platform-admin/utils/tiptapToQuillDelta";
import { useToast } from "@/providers/toast-provider";

const BlogQuillEditor = dynamic(() => import("@/features/platform-admin/components/blog/BlogQuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-[46rem] space-y-3 px-6 py-8" aria-label="Loading editor">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
});

async function uploadInlineImage(file: File): Promise<string> {
  const uploaded = await uploadBlogImage(file, "inline");
  return uploaded.url;
}

type EditorBodyProps = {
  post: BlogPost;
  dirty: boolean;
  onDirty: () => void;
  onRequestClose: () => void;
  onSaved: () => void;
};

/** Mounted only while the sheet is open, so the editor starts from a snapshot of the post. */
function BlogContentEditorBody({ post, dirty, onDirty, onRequestClose, onSaved }: EditorBodyProps) {
  const { toast } = useToast();
  const savePost = useSaveBlogPost();
  const [initialOps] = useState<QuillOp[]>(() => tiptapToQuillDelta(post.body));
  const [result, setResult] = useState<QuillToTipTapResult>(() => quillDeltaToTiptap(initialOps));
  const isNew = !hasTipTapContent(post.body);

  const handleChange = useCallback(
    (ops: QuillOp[], source: string) => {
      setResult(quillDeltaToTiptap(ops));
      if (source === "user") {
        onDirty();
      }
    },
    [onDirty],
  );

  const handleUploadError = useCallback(
    (message: string) => toast({ variant: "error", title: "Image upload failed", description: message }),
    [toast],
  );

  async function handleSave() {
    try {
      await savePost.mutateAsync({
        postId: post.id,
        input: toBlogPostInput(post, { body: result.doc, bodyText: result.plainText }),
      });
      toast({ variant: "success", title: "Content saved" });
      onSaved();
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save content",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-dash-border/80 px-6 py-3 pr-14">
        <div className="min-w-0">
          <SheetTitle className="text-base">{isNew ? "Add content" : "Edit content"}</SheetTitle>
          <SheetDescription className="truncate">{post.title}</SheetDescription>
        </div>
        <div className="flex shrink-0 gap-2">
          <SecondaryButton type="button" size="sm" onClick={onRequestClose} disabled={savePost.isPending}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" size="sm" onClick={() => void handleSave()} disabled={savePost.isPending || !dirty}>
            {savePost.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save content
          </PrimaryButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 px-4 sm:px-6">
        <BlogQuillEditor
          initialOps={initialOps}
          onChange={handleChange}
          uploadImage={uploadInlineImage}
          onUploadError={handleUploadError}
        />
      </div>
      <BlogEditorStatusBar plainText={result.plainText} droppedFormats={result.droppedFormats} dirty={dirty} />
    </div>
  );
}

type BlogContentEditorSheetProps = {
  post: BlogPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BlogContentEditorSheet({ post, open, onOpenChange }: BlogContentEditorSheetProps) {
  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);

  function close() {
    setDirty(false);
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true);
      return;
    }
    if (dirty && !window.confirm("Discard your unsaved changes?")) {
      return;
    }
    close();
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-[calc(100vw-1rem)] max-w-none p-0 sm:max-w-none"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        data-testid="blog-content-editor-sheet"
      >
        <BlogContentEditorBody
          post={post}
          dirty={dirty}
          onDirty={markDirty}
          onRequestClose={() => handleOpenChange(false)}
          onSaved={close}
        />
      </SheetContent>
    </Sheet>
  );
}
