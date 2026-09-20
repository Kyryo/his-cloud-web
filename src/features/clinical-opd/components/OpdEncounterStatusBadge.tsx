import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  waiting: "Waiting",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const styles: Record<string, string> = {
  waiting: "bg-amber-50 text-amber-800",
  in_progress: "bg-brand-tint text-brand-primary",
  completed: "bg-slate-100 text-brand-slate",
  cancelled: "bg-red-50 text-red-800",
};

type OpdEncounterStatusBadgeProps = {
  status: string;
  className?: string;
};

export function OpdEncounterStatusBadge({
  status,
  className,
}: OpdEncounterStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-slate-100 text-brand-slate",
        className,
      )}
    >
      {labels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}
