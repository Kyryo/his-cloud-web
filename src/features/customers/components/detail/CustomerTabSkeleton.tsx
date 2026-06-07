import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard1Grid } from "@/components/stats-card1";
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
    <div className={cn("space-y-4", className)} data-testid="customer-tab-skeleton">
      {statCards > 0 ? (
        <StatsCard1Grid>
          {Array.from({ length: statCards }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] rounded-xl" />
          ))}
        </StatsCard1Grid>
      ) : null}
      <div className="space-y-3 rounded-xl border border-brand-border bg-white p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
