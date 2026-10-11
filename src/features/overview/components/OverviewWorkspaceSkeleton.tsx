import { Skeleton } from "@/components/ui/skeleton";

export function OverviewWorkspaceSkeleton() {
  return (
    <div data-testid="overview-skeleton" aria-hidden className="space-y-8">
      <Skeleton className="mx-auto h-4 w-56 bg-dash-border/70" />
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-2xl bg-dash-border/60" />
        <Skeleton className="h-16 w-full rounded-2xl bg-dash-border/60" />
        <Skeleton className="h-16 w-full rounded-2xl bg-dash-border/60" />
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