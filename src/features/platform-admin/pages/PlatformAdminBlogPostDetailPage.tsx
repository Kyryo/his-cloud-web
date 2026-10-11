"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ListPageBlankState, ListPageLayout } from "@/features/app-shell/components/page-layout";
import { BlogContentEditorSheet } from "@/features/platform-admin/components/blog/BlogContentEditorSheet";
import { BlogDeletePostDialog } from "@/features/platform-admin/components/blog/BlogDeletePostDialog";
import { BlogPostContentSection } from "@/features/platform-admin/components/blog/BlogPostContentSection";
import { BlogPostCover } from "@/features/platform-admin/components/blog/BlogPostCover";
import { BlogPostDetailHeader } from "@/features/platform-admin/components/blog/BlogPostDetailHeader";
import { BlogPostDetailSkeleton } from "@/features/platform-admin/components/blog/BlogPostDetailSkeleton";
import { BlogPostDetailsSheet } from "@/features/platform-admin/components/blog/BlogPostDetailsSheet";
import { BlogPostMetaList } from "@/features/platform-admin/components/blog/BlogPostMetaList";
import { BlogPostStatsSection } from "@/features/platform-admin/components/blog/BlogPostStatsSection";
import { useBlogPost, useSaveBlogPost } from "@/features/platform-admin/hooks/use-blog-cms";
import { togglePublishInput } from "@/features/platform-admin/schemas/blog-post.schema";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { hasTipTapContent } from "@/features/platform-admin/utils/tiptapToQuillDelta";
import { useToast } from "@/providers/toast-provider";

type OpenPanel = "details" | "content" | "delete" | null;

function BlogPostDetail({ post }: { post: BlogPost }) {
  const router = useRouter();
  const { toast } = useToast();
  const savePost = useSaveBlogPost();
  const [panel, setPanel] = useState<OpenPanel>(null);
  const hasContent = hasTipTapContent(post.body);

  async function handleTogglePublish() {
    const publishing = post.status !== "published";
    try {
      await savePost.mutateAsync({ postId: post.id, input: togglePublishInput(post) });
      toast({ variant: "success", title: publishing ? "Post published" : "Post moved to drafts" });
    } catch (error) {
      toast({
        variant: "error",
        title: publishing ? "Could not publish" : "Could not unpublish",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const closePanel = (open: boolean) => !open && setPanel(null);

  return (
    <ListPageLayout data-testid="platform-admin-blog-post-detail" className="space-y-8">
      <BlogPostDetailHeader
        post={post}
        hasContent={hasContent}
        isTogglingPublish={savePost.isPending}
        onEditDetails={() => setPanel("details")}
        onEditContent={() => setPanel("content")}
        onTogglePublish={() => void handleTogglePublish()}
        onDelete={() => setPanel("delete")}
      />

      {post.mainImageUrl ? (
        <BlogPostCover
          src={post.mainImageUrl}
          alt={post.mainImageAlt}
          className="aspect-[21/9] max-h-80 w-full rounded-lg"
          sizes="(min-width: 1024px) 70vw, 100vw"
          priority
        />
      ) : null}

      <div className="border-y border-dash-border/80 py-5">
        <BlogPostStatsSection postId={post.id} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BlogPostContentSection body={post.body} hasContent={hasContent} onEditContent={() => setPanel("content")} />
        <aside>
          <BlogPostMetaList post={post} />
        </aside>
      </div>

      <BlogPostDetailsSheet post={post} open={panel === "details"} onOpenChange={closePanel} />
      <BlogContentEditorSheet post={post} open={panel === "content"} onOpenChange={closePanel} />
      <BlogDeletePostDialog
        post={panel === "delete" ? post : null}
        onOpenChange={closePanel}
        onDeleted={() => router.replace(ROUTES.platformAdminBlogPosts)}
      />
    </ListPageLayout>
  );
}

export function PlatformAdminBlogPostDetailPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId ?? "";
  const postQuery = useBlogPost(postId);

  if (postQuery.isPending) {
    return <BlogPostDetailSkeleton />;
  }
  if (postQuery.isError || !postQuery.data) {
    return (
      <ListPageLayout>
        <ListPageBlankState
          tone={postQuery.isError ? "error" : "default"}
          icon={postQuery.isError ? undefined : "file"}
          title={postQuery.isError ? "This post could not be loaded" : "Post not found"}
          description={
            postQuery.isError
              ? "The blog service did not respond. Try again in a moment."
              : "It may have been deleted, or the link is wrong."
          }
          action={
            postQuery.isError ? (
              <Button variant="outline" onClick={() => void postQuery.refetch()}>Try again</Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={ROUTES.platformAdminBlogPosts}>Back to posts</Link>
              </Button>
            )
          }
        />
      </ListPageLayout>
    );
  }
  return <BlogPostDetail post={postQuery.data} />;
}
