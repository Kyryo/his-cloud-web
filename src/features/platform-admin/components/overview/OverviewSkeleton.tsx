import { Skeleton } from "@/components/ui/skeleton";

function Block({ className }: { className: string }) {
  return <Skeleton className={`bg-foreground/[0.06] ${className}`} />;
}

export function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading overview" className="space-y-14">
      <div className="space-y-2">
        <Block className="h-3 w-20" />
        <Block className="h-8 w-48" />
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
      <div className="space-y-4">
        <Block className="h-3 w-28" />
        <Block className="h-10 w-24" />
        <Block className="h-[300px] w-full rounded-xl" />
      </div>
      <div className="grid gap-12 xl:grid-cols-5">
        <Block className="h-[340px] rounded-xl xl:col-span-3" />
        <Block className="h-[340px] rounded-xl xl:col-span-2" />
      </div>
    </div>
  );
}
