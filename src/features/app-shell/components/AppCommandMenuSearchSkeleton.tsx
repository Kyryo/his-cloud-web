import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = [
  { title: "h-3.5 w-[52%]", subtitle: "h-2.5 w-[28%]" },
  { title: "h-3.5 w-[64%]", subtitle: "h-2.5 w-[36%]" },
  { title: "h-3.5 w-[44%]", subtitle: "h-2.5 w-[22%]" },
] as const;

type AppCommandMenuSearchSkeletonProps = {
  showClients: boolean;
  showBilling: boolean;
};

export function AppCommandMenuSearchSkeleton({
  showClients,
  showBilling,
}: AppCommandMenuSearchSkeletonProps) {
  const groups = [
    ...(showClients ? [{ heading: "Clients", rows: 3 }] : []),
    ...(showBilling
      ? [
          { heading: "Sales orders", rows: 2 },
          { heading: "Invoices", rows: 2 },
        ]
      : []),
  ];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="app-command-menu-loading"
      className="px-1 py-1"
    >
      <span className="sr-only">Searching records</span>
      {groups.map((group) => (
        <div key={group.heading} className="overflow-hidden p-1">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {group.heading}
          </p>
          {SKELETON_ROWS.slice(0, group.rows).map((row, index) => (
            <div
              key={`${group.heading}-${index}`}
              className="flex items-center gap-2 rounded-sm px-2 py-2"
            >
              <Skeleton className="size-4 shrink-0 rounded" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className={row.title} />
                <Skeleton className={row.subtitle} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
