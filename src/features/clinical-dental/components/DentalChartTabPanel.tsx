"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { DentalChart } from "@/features/clinical-dental/components/DentalChart";
import { DentalFindingDialog } from "@/features/clinical-dental/components/DentalFindingDialog";
import { DentalToothHistorySheet } from "@/features/clinical-dental/components/DentalToothHistorySheet";
import { useDentalChart } from "@/features/clinical-dental/hooks/use-clinical-dental";
import type { DentalChartFinding } from "@/features/clinical-dental/types/clinical-dental.types";
import { toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  DENTAL_CONDITION_META,
  formatSurfaces,
} from "@/features/clinical-dental/utils/dental-conditions";
import type { ClinicalWorkspacePanelProps } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  inferDentitionMode,
  type DentitionMode,
} from "@/features/dental/lib/dental-dentition";
import { cn } from "@/lib/utils";

const NO_FINDINGS: DentalChartFinding[] = [];

export function DentalChartTabPanel({
  visitUuid,
  encounterUuid,
  isActive,
}: ClinicalWorkspacePanelProps) {
  const { capabilities, isChartLocked } = useOpdEncounterWorkspace();
  const chartQuery = useDentalChart(visitUuid, encounterUuid);
  const [modeOverride, setModeOverride] = useState<DentitionMode | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [findingTooth, setFindingTooth] = useState<number | null>(null);

  const current = chartQuery.data?.current ?? NO_FINDINGS;
  const encounterFindings = chartQuery.data?.encounter_findings ?? NO_FINDINGS;
  const mode =
    modeOverride ?? inferDentitionMode(current.map((finding) => finding.tooth_number));
  const canRecord = capabilities.includes("record_dental_chart") && !isChartLocked;

  if (!isActive) {
    return null;
  }

  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem]"
      data-testid="dental-chart-tab-panel"
    >
      <section className="space-y-4 bg-white px-4 py-5 sm:px-6" aria-label="Dental chart">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Dental chart</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Select a tooth to see its history and record findings.
          </p>
        </div>
        {!canRecord ? (
          <OpdConsultFormLocked
            message={
              isChartLocked
                ? "This encounter is closed. The chart is read-only."
                : "Your role can view the chart but not record findings."
            }
          />
        ) : null}
        {chartQuery.isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : chartQuery.isError ? (
          <p className="text-sm text-red-700">Could not load the dental chart.</p>
        ) : (
          <DentalChart
            findings={current}
            mode={mode}
            onModeChange={setModeOverride}
            selectedTooth={selectedTooth}
            onSelectTooth={setSelectedTooth}
          />
        )}
      </section>

      <div className="border-t border-dash-border/70 bg-dash-canvas xl:border-l xl:border-t-0">
        <OpdConsultContentPanel
          title="Findings this visit"
          count={encounterFindings.length}
          data-testid="dental-encounter-findings"
        >
          {encounterFindings.length === 0 ? (
            <p className="text-sm text-dash-muted">No findings recorded this visit.</p>
          ) : (
            <ul className="space-y-2">
              {encounterFindings.map((finding) => (
                <li key={finding.uuid}>
                  <button
                    type="button"
                    onClick={() => setSelectedTooth(finding.tooth_number)}
                    className="w-full rounded-lg border border-dash-border/70 bg-white px-3 py-2 text-left hover:border-brand-primary/40"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-brand-navy">
                      <span
                        className={cn(
                          "inline-block size-2.5 rounded-sm",
                          DENTAL_CONDITION_META[finding.condition].swatchClassName,
                        )}
                        aria-hidden="true"
                      />
                      {finding.tooth_number} · {DENTAL_CONDITION_META[finding.condition].label}
                      {finding.surfaces.length > 0
                        ? ` · ${formatSurfaces(finding.surfaces)}`
                        : null}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-brand-muted">
                      {toothName(finding.tooth_number)} ·{" "}
                      {formatDisplayDateTime(finding.recorded_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </OpdConsultContentPanel>
      </div>

      <DentalToothHistorySheet
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        toothNumber={selectedTooth}
        canRecord={canRecord}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTooth(null);
          }
        }}
        onRecordFinding={(toothNumber) => {
          setSelectedTooth(null);
          setFindingTooth(toothNumber);
        }}
      />
      <DentalFindingDialog
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        toothNumber={findingTooth}
        open={findingTooth !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFindingTooth(null);
          }
        }}
      />
    </div>
  );
}
