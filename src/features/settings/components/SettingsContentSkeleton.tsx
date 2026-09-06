import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SettingsContentSkeletonProps = {
  variant?: "rows" | "staff" | "matrix" | "form";
  rows?: number;
  showHeader?: boolean;
  className?: string;
  label?: string;
};

function SectionHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

function RowSkeleton({
  controlClassName,
}: {
  controlClassName: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-border py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3 w-56 max-w-[80%]" />
      </div>
      <Skeleton className={cn("shrink-0", controlClassName)} />
    </div>
  );
}

export function SettingsContentSkeleton({
  variant = "rows",
  rows = 6,
  showHeader = true,
  className,
  label = "Loading",
}: SettingsContentSkeletonProps) {
  if (variant === "staff") {
    return (
      <div
        className={cn("space-y-6", className)}
        role="status"
        aria-label={label}
      >
        {showHeader ? <SectionHeaderSkeleton /> : null}
        <Skeleton className="h-10 w-full max-w-sm" />
        <div>
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b border-brand-border py-3.5 last:border-b-0"
            >
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36 max-w-full" />
                <Skeleton className="h-3 w-52 max-w-[80%]" />
              </div>
              <Skeleton className="h-10 w-36 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "matrix") {
    return (
      <div
        className={cn("space-y-8", className)}
        role="status"
        aria-label={label}
      >
        {Array.from({ length: 2 }, (_, section) => (
          <div key={section} className="space-y-4">
            {showHeader ? <SectionHeaderSkeleton /> : null}
            <div className="flex justify-end gap-10 pb-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: section === 0 ? 5 : 6 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 border-b border-brand-border py-3.5 last:border-b-0"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-3 w-48 max-w-[75%]" />
                </div>
                <div className="flex shrink-0 gap-10">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div
        className={cn("space-y-8", className)}
        role="status"
        aria-label={label}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <SectionHeaderSkeleton />
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", className)}
      role="status"
      aria-label={label}
    >
      {showHeader ? <SectionHeaderSkeleton /> : null}
      <div>
        {Array.from({ length: rows }, (_, index) => (
          <RowSkeleton key={index} controlClassName="h-5 w-24" />
        ))}
      </div>
    </div>
  );
}
