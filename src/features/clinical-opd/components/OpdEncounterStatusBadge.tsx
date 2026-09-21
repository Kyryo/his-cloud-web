import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  waiting: "Waiting",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const styles: Record<string, string> = {
  waiting: "border-amber-200 bg-amber-50 text-amber-900",
  in_progress: "border-brand-primary/25 bg-brand-tint text-brand-primary",
  completed: "border-dash-border bg-white text-brand-slate",
  cancelled: "border-red-200 bg-red-50 text-red-800",
};

type OpdEncounterStatusBadgeProps = {
  status: string;
  className?: string;
};

/**
 * Queue status chip styled like a compact outline button.
 */
export function OpdEncounterStatusBadge({
  status,
  className,
}: OpdEncounterStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center justify-center rounded-md border px-2.5 text-xs font-medium",
        styles[status] ??
          "border-dash-border bg-white text-brand-slate",
        className,
      )}
      data-testid="opd-encounter-status-badge"
    >
      {labels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
