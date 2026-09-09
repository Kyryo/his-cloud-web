import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentsBoardSkeleton() {
  return (
    <div
      aria-busy="true"
      data-testid="appointments-board-skeleton"
      className="flex h-[calc(100dvh-11.5rem)] min-h-0 flex-1 flex-col"
    >
      <span className="sr-only">Loading board</span>
      <div className="flex h-full min-h-0 flex-1 gap-3 overflow-hidden">
        {Array.from({ length: 4 }, (_, column) => (
          <div
            key={column}
            className="flex h-full w-[18.5rem] shrink-0 flex-col space-y-2 rounded-2xl bg-dash-canvas/90 p-2.5"
          >
            <div className="flex items-center justify-between px-1.5 py-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-7 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
