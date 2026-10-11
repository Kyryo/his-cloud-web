"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListPageBlankState, ListPagePagination } from "@/features/app-shell/components/page-layout";
import { BlogPostsTable } from "@/features/platform-admin/components/blog/BlogPostsTable";
import { BlogPostsTableSkeleton } from "@/features/platform-admin/components/blog/BlogPostsTableSkeleton";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { BLOG_POSTS_PAGE_SIZE } from "@/features/platform-admin/utils/blog-post-list";

type BlogPostsResultsProps = {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  page: { rows: BlogPost[]; totalCount: number; page: number; hasPrevious: boolean; hasNext: boolean };
  onRetry: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onDelete: (post: BlogPost) => void;
};

export function BlogPostsResults({
  isPending,
  isError,
  isFetching,
  hasActiveFilters,
  page,
  onRetry,
  onClearFilters,
  onCreate,
  onPageChange,
  onDelete,
}: BlogPostsResultsProps) {
  if (isPending) {
    return <BlogPostsTableSkeleton />;
  }
  if (isError) {
    return (
      <ListPageBlankState
        tone="error"
        title="Posts could not be loaded"
        description="The blog service did not respond. Check your connection and try again."
        action={<Button variant="outline" onClick={onRetry}>Try again</Button>}
        compact
      />
    );
  }
  if (page.totalCount === 0) {
    return hasActiveFilters ? (
      <ListPageBlankState
        icon="search"
        title="No posts match"
        description="Try a different search, status or category."
        action={<Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
        compact
      />
    ) : (
      <ListPageBlankState
        icon="file"
        title="No posts yet"
        description="Create the first post for the public blog. It stays a draft until you publish it."
        action={
          <Button variant="primary" onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New post
          </Button>
        }
        compact
      />
    );
  }
  return (
    <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
      <BlogPostsTable posts={page.rows} onDelete={onDelete} />
      <ListPagePagination
        page={page.page}
        pageSize={BLOG_POSTS_PAGE_SIZE}
        totalCount={page.totalCount}
        hasPrevious={page.hasPrevious}
        hasNext={page.hasNext}
        onPageChange={onPageChange}
        isLoading={isFetching}
      />
    </div>
  );
}
