import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentDetailSkeleton() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      data-testid="appointment-detail-skeleton"
    >
      <span className="sr-only">Loading appointment</span>
      <div>
        <Skeleton className="h-3 w-12" />
        <Skeleton className="mt-2 h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-36" />
      </div>
      <div className="space-y-4 border-y border-dash-border/70 py-4">
        <div className="flex justify-between gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex justify-between gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
