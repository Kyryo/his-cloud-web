import type {
  DentalChartFinding,
  DentalProcedure,
} from "@/features/clinical-dental/types/clinical-dental.types";
import {
  DENTAL_CONDITION_META,
  formatSurfaces,
} from "@/features/clinical-dental/utils/dental-conditions";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

export function DentalFindingList({
  findings,
  emptyMessage,
}: {
  findings: readonly DentalChartFinding[];
  emptyMessage: string;
}) {
  if (findings.length === 0) {
    return <p className="px-1 py-4 text-sm text-dash-muted">{emptyMessage}</p>;
  }
  return (
    <ul className="space-y-2" data-testid="dental-history-findings">
      {findings.map((finding) => (
        <li
          key={finding.uuid}
          className="border-b border-dash-border/70 py-2 last:border-b-0"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-brand-navy">
            <span
              className={cn(
                "inline-block size-2.5 rounded-sm",
                DENTAL_CONDITION_META[finding.condition].swatchClassName,
              )}
              aria-hidden="true"
            />
            Tooth {finding.tooth_number} · {DENTAL_CONDITION_META[finding.condition].label}
            {finding.surfaces.length > 0 ? ` · ${formatSurfaces(finding.surfaces)}` : null}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {finding.status === "resolved" ? "Resolved" : "Active"}
            {finding.recorded_by_name ? ` · ${finding.recorded_by_name}` : null}
          </p>
          {finding.notes ? (
            <p className="mt-1 text-xs text-brand-slate">{finding.notes}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function DentalProcedureList({
  procedures,
  emptyMessage,
}: {
  procedures: readonly DentalProcedure[];
  emptyMessage: string;
}) {
  if (procedures.length === 0) {
    return <p className="px-1 py-4 text-sm text-dash-muted">{emptyMessage}</p>;
  }
  return (
    <ul className="space-y-2" data-testid="dental-history-procedures">
      {procedures.map((procedure) => (
        <li
          key={procedure.uuid}
          className="border-b border-dash-border/70 py-2 last:border-b-0"
        >
          <p className="text-xs font-semibold text-brand-navy">
            {procedure.procedure_name}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {procedure.tooth_numbers.length > 0
              ? `Teeth ${procedure.tooth_numbers.join(", ")}`
              : "Whole mouth"}
            {procedure.surfaces.length > 0
              ? ` · ${formatSurfaces(procedure.surfaces)}`
              : null}
            {` · ${formatDisplayDate(procedure.treatment_date)}`}
          </p>
          {procedure.notes ? (
            <p className="mt-1 line-clamp-2 text-xs text-brand-slate">{procedure.notes}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
