import { Skeleton } from "@/components/ui/skeleton";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { BlogRecentPostsListSkeleton } from "@/features/platform-admin/components/blog/BlogRecentPostsList";

/** Route-level loading state for the blog overview. */
export function BlogHubPageSkeleton() {
  return (
    <ListPageLayout className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex gap-10 border-y border-dash-border/80 py-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BlogRecentPostsListSkeleton />
        <BlogRecentPostsListSkeleton />
      </div>
    </ListPageLayout>
  );
}
