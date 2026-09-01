import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CustomerTabSkeletonProps = {
  statCards?: number;
  rows?: number;
  className?: string;
};

export function CustomerTabSkeleton({
  statCards = 0,
  rows = 4,
  className,
}: CustomerTabSkeletonProps) {
  return (
    <div className={cn("space-y-5", className)} data-testid="customer-tab-skeleton">
      {statCards > 0 ? (
        <div
          className="grid grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
          aria-busy="true"
        >
          {Array.from({ length: statCards }).map((_, index) => (
            <div key={index} className="p-3.5 sm:p-4">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="mt-2.5 h-8 w-16" />
              <Skeleton className="mt-1.5 h-3 w-28" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-dash-border/80 bg-white">
        <div className="border-b border-dash-border/80 bg-slate-50/70 px-4 py-3 sm:px-5">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-dash-border/60">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3 sm:px-5">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
