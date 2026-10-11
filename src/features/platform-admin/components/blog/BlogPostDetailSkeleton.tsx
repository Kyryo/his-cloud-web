import { Skeleton } from "@/components/ui/skeleton";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";

/** Mirrors the post detail layout: header, stats row, chart, content and details column. */
export function BlogPostDetailSkeleton() {
  return (
    <ListPageLayout className="space-y-8" data-testid="blog-post-detail-loading">
      <div className="space-y-3">
        <Skeleton className="h-3 w-12" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-80 max-w-full" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
      <div className="space-y-4 border-y border-dash-border/80 py-5">
        <div className="flex gap-10">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </ListPageLayout>
  );
}
