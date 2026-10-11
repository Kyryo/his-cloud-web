import { Skeleton } from "@/components/ui/skeleton";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { BlogPostsTableSkeleton } from "@/features/platform-admin/components/blog/BlogPostsTableSkeleton";

/** Route-level loading state; mirrors the posts page header, toolbar and table. */
export function BlogPostsPageSkeleton() {
  return (
    <ListPageLayout className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-3">
        <div className="flex gap-5 border-b border-dash-border/80 pb-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 sm:max-w-sm" />
          <Skeleton className="hidden h-8 w-44 sm:block" />
          <Skeleton className="hidden h-8 w-44 sm:block" />
        </div>
      </div>
      <BlogPostsTableSkeleton />
    </ListPageLayout>
  );
}
