import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { BlogPostCover } from "@/features/platform-admin/components/blog/BlogPostCover";
import { BlogPostStatusBadge } from "@/features/platform-admin/components/blog/BlogPostStatusBadge";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { formatBlogDate } from "@/features/platform-admin/utils/blog-format";

type BlogRecentPostsListProps = {
  posts: BlogPost[];
  isLoading: boolean;
};

const SKELETON_ROWS = 5;

export function BlogRecentPostsListSkeleton() {
  return (
    <ul className="divide-y divide-dash-border/60" aria-hidden="true">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <li key={index} className="flex items-center gap-3 py-3">
          <Skeleton className="h-10 w-16" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function BlogRecentPostsList({ posts, isLoading }: BlogRecentPostsListProps) {
  if (isLoading) {
    return <BlogRecentPostsListSkeleton />;
  }
  if (posts.length === 0) {
    return <p className="py-6 text-sm text-dash-muted">No posts yet. Create your first post to see it here.</p>;
  }
  return (
    <ul className="divide-y divide-dash-border/60">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={ROUTES.platformAdminBlogPost(post.id)}
            className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-white/70"
          >
            <BlogPostCover src={post.mainImageUrl} alt={post.mainImageAlt} className="h-10 w-16" sizes="64px" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-navy">{post.title || "Untitled"}</p>
              <p className="mt-0.5 truncate text-xs text-dash-muted">
                {post.author?.name ?? "No author"} · Updated {formatBlogDate(post.updatedAt)}
              </p>
            </div>
            <BlogPostStatusBadge post={post} />
            <ChevronRight className="size-4 text-dash-muted/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
