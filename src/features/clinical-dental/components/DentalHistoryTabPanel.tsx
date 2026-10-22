"use client";

import { History } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DentalFindingList,
  DentalProcedureList,
} from "@/features/clinical-dental/components/DentalHistoryLists";
import { useDentalHistory } from "@/features/clinical-dental/hooks/use-clinical-dental";
import type { ClinicalWorkspacePanelProps } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";

/** Every earlier dental visit of the client, newest first. */
export function DentalHistoryTabPanel({
  visitUuid,
  encounterUuid,
  isActive,
}: ClinicalWorkspacePanelProps) {
  const historyQuery = useDentalHistory(visitUuid, encounterUuid);

  if (!isActive) {
    return null;
  }

  const visits = historyQuery.data ?? [];

  return (
    <section
      className="space-y-4 bg-white px-4 py-5 sm:px-6"
      aria-label="Dental history"
      data-testid="dental-history-tab-panel"
    >
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Dental history</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Earlier dental visits with their chart findings and procedures. Only dental
          care is shown here.
        </p>
      </div>

      {historyQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : historyQuery.isError ? (
        <p className="text-sm text-red-700">Could not load the dental history.</p>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={History}
          title="No earlier dental visits"
          description="Findings and procedures from earlier dental visits will appear here."
        />
      ) : (
        <ol className="space-y-4">
          {visits.map((visit) => (
            <li
              key={visit.encounter_uuid}
              className="rounded-xl border border-dash-border"
              data-testid="dental-history-visit"
            >
              <div className="border-b border-dash-border/70 px-4 py-3">
                <p className="text-sm font-semibold text-brand-navy">
                  {formatDisplayDate(visit.visit_date ?? visit.started_at ?? "")}
                </p>
                <p className="mt-0.5 text-[11px] text-brand-muted">
                  {[visit.department_name, visit.clinic_name, visit.clinician_name]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="grid gap-4 px-4 py-3 md:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                    Chart findings
                  </h3>
                  <DentalFindingList
                    findings={visit.chart_findings}
                    emptyMessage="No chart findings."
                  />
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                    Procedures
                  </h3>
                  <DentalProcedureList
                    procedures={visit.procedures}
                    emptyMessage="No procedures."
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
