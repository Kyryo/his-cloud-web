import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  type BoardMetrics,
  type BoardStatusFilter,
} from "@/features/reports/utils/todays-appointments-board";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/utils/format-compact-number";

const METRICS: Array<{
  id: BoardStatusFilter;
  label: string;
  value: (metrics: BoardMetrics) => string;
  hint?: (metrics: BoardMetrics) => string | null;
  live?: boolean;
}> = [
  {
    id: "all",
    label: "Booked",
    value: (metrics) => formatCompactNumber(metrics.total),
  },
  {
    id: "live",
    label: "In session",
    value: (metrics) => formatCompactNumber(metrics.live),
    live: true,
  },
  {
    id: "upcoming",
    label: "Upcoming",
    value: (metrics) => formatCompactNumber(metrics.upcoming),
  },
  {
    id: "done",
    label: "Completed",
    value: (metrics) => formatCompactNumber(metrics.done),
  },
  {
    id: "missed",
    label: "Missed",
    value: (metrics) => formatCompactNumber(metrics.missed),
  },
  {
    id: "due",
    label: "Due",
    value: (metrics) => formatCompactNumber(metrics.dueCount),
    hint: (metrics) =>
      metrics.dueAmount > 0 ? formatInvoiceAmount(metrics.dueAmount) : null,
  },
];

type TodaysAppointmentsBoardMetricsProps = {
  metrics: BoardMetrics;
  activeFilter: BoardStatusFilter;
  onFilterChange: (filter: BoardStatusFilter) => void;
};

export function TodaysAppointmentsBoardMetrics({
  metrics,
  activeFilter,
  onFilterChange,
}: TodaysAppointmentsBoardMetricsProps) {
  return (
    <div
      className="flex overflow-x-auto border-y border-dash-border/80"
      data-testid="todays-appointments-metrics"
    >
      {METRICS.map((metric) => {
        const active = activeFilter === metric.id;
        const hint = metric.hint?.(metrics) ?? null;
        const showPulse = Boolean(metric.live && metrics.live > 0);

        return (
          <button
            key={metric.id}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onFilterChange(active && metric.id !== "all" ? "all" : metric.id)
            }
            className={cn(
              "min-w-[6.5rem] flex-1 border-r border-dash-border/60 px-3 py-3 text-left last:border-r-0 hover:bg-dash-canvas/40 sm:px-4",
              active && "bg-dash-canvas/70",
            )}
            data-testid={`todays-appointments-metric-${metric.id}`}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-dash-muted">
              {showPulse ? (
                <span className="relative flex size-1.5 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                </span>
              ) : null}
              {metric.label}
            </span>
            <span
              className={cn(
                "mt-1 block text-xl font-semibold tabular-nums tracking-tight text-brand-navy sm:text-2xl",
                active && "text-brand-primary",
              )}
            >
              {metric.value(metrics)}
            </span>
            {hint ? (
              <span className="mt-0.5 block truncate text-[11px] tabular-nums text-amber-700">
                {hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
