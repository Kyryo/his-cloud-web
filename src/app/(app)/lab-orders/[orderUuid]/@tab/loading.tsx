import { Skeleton } from "@/components/ui/skeleton";

export default function LabOrderDetailTabLoading() {
  return (
    <div className="space-y-5 p-4 sm:p-6" data-testid="lab-order-tab-skeleton">
      <div className="overflow-hidden rounded-xl border border-dash-border/80 bg-white">
        <div className="border-b border-dash-border/80 bg-slate-50/70 px-4 py-3 sm:px-5">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-dash-border/60">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 sm:px-5"
            >
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
