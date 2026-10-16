import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Block = ({ className }: { className: string }) => (
  <Skeleton className={`bg-foreground/[0.06] ${className}`} />
);

export function FinanceSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading finance"
      className="mx-auto w-full max-w-[1280px] space-y-14"
    >
      <div className="space-y-2">
        <Block className="h-8 w-40" />
        <Block className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 border-y border-foreground/[0.07] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-4 py-6 sm:px-6 sm:first:pl-0">
            <Block className="h-3 w-24" />
            <Block className="h-9 w-32" />
            <Block className="h-4 w-20" />
          </div>
        ))}
      </div>
      <Block className="h-[340px] w-full rounded-xl" />
      <Block className="h-[280px] w-full rounded-xl" />
    </div>
  );
}

export function FinanceErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/30 bg-destructive/[0.03] px-6 text-center"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-foreground">
        Couldn&apos;t load finance records
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
