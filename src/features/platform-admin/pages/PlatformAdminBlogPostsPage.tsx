"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { BlogDeletePostDialog } from "@/features/platform-admin/components/blog/BlogDeletePostDialog";
import { BlogPostCreateSheet } from "@/features/platform-admin/components/blog/BlogPostCreateSheet";
import { BlogPostsResults } from "@/features/platform-admin/components/blog/BlogPostsResults";
import { BlogPostsToolbar } from "@/features/platform-admin/components/blog/BlogPostsToolbar";
import { useBlogCategories, useBlogPosts } from "@/features/platform-admin/hooks/use-blog-cms";
import { useBlogPostListQuery } from "@/features/platform-admin/hooks/use-blog-post-list-query";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { countActiveBlogFilters, selectBlogPostPage } from "@/features/platform-admin/utils/blog-post-list";

export function PlatformAdminBlogPostsPage() {
  const { query, setQuery, isCreateOpen, setCreateOpen } = useBlogPostListQuery();
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const postsQuery = useBlogPosts({
    status: query.status === "all" ? undefined : query.status,
    search: query.search || undefined,
  });
  const categories = useBlogCategories().data?.results ?? [];
  const page = selectBlogPostPage(postsQuery.data?.results ?? [], query);

  return (
    <ListPageLayout data-testid="platform-admin-blog-posts" className="space-y-5">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock title="Posts" description="Draft, schedule and publish posts for the public blog." />
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} data-testid="blog-new-post">
            <Plus className="size-4" aria-hidden="true" />
            New post
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <BlogPostsToolbar query={query} categories={categories} onChange={setQuery} />

      <BlogPostsResults
        isPending={postsQuery.isPending}
        isError={postsQuery.isError}
        isFetching={postsQuery.isFetching}
        hasActiveFilters={countActiveBlogFilters(query) > 0}
        page={page}
        onRetry={() => void postsQuery.refetch()}
        onClearFilters={() => setQuery({ search: "", status: "all", categoryId: "all" })}
        onCreate={() => setCreateOpen(true)}
        onPageChange={(next) => setQuery({ page: next })}
        onDelete={setPostToDelete}
      />

      <BlogPostCreateSheet open={isCreateOpen} onOpenChange={setCreateOpen} />
      <BlogDeletePostDialog post={postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)} />
    </ListPageLayout>
  );
}
