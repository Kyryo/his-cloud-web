import { Skeleton } from "@/components/ui/skeleton";

export function OverviewWorkspaceSkeleton() {
  return (
    <div data-testid="overview-skeleton" aria-hidden className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-[5.75rem] w-full rounded-2xl bg-dash-border/60" />
        <Skeleton className="h-[5.75rem] w-full rounded-2xl bg-dash-border/60" />
        <Skeleton className="h-[5.75rem] w-full rounded-2xl bg-dash-border/60" />
        <Skeleton className="h-[5.75rem] w-full rounded-2xl bg-dash-border/60" />
      </div>
    </div>
  );
}

export function OverviewSectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div aria-hidden className="space-y-3">
      <Skeleton className="h-4 w-40 bg-dash-border/70" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-2xl bg-dash-border/60" />
      ))}
    </div>
  );
}
