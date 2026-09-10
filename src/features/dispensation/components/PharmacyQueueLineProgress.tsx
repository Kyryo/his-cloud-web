import { cn } from "@/lib/utils";

type PharmacyQueueLineProgressProps = {
  ordered: number;
  dispensed: number;
  className?: string;
};

export function PharmacyQueueLineProgress({
  ordered,
  dispensed,
  className,
}: PharmacyQueueLineProgressProps) {
  const percent =
    ordered > 0 ? Math.min(100, Math.max(0, (dispensed / ordered) * 100)) : 0;
  const complete = ordered > 0 && dispensed >= ordered;

  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-slate-100",
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <div
        className={cn(
          "h-full rounded-full",
          complete ? "bg-emerald-500" : "bg-brand-primary",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
