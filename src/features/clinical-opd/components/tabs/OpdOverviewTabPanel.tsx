"use client";

import Link from "next/link";

import { OpdEncounterActivityLog } from "@/features/clinical-opd/components/detail/OpdEncounterActivityLog";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OpdConsultChart } from "@/features/clinical-opd/components/tabs/OpdConsultChart";
import {
  useEncounterHistorySummary,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { selectRecentOpdTimelineEvents } from "@/features/clinical-opd/utils/opd-encounter-overview";
import { opdEncounterTabHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";

type OpdOverviewTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdOverviewTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdOverviewTabPanelProps) {
  const { visibleTabIds, capabilities, chartSummary } =
    useOpdEncounterWorkspace();
  const workspace = useEncounterWorkspace(visitUuid, encounterUuid);
  const historySummary = useEncounterHistorySummary(
    visitUuid,
    encounterUuid,
    isActive,
  );

  if (!isActive) {
    return null;
  }

  const canWriteComplaint = capabilities.includes("record_chief_complaint");
  const canWriteHpi = capabilities.includes("record_hpi");
  const canWriteExam = capabilities.includes("record_physical_exam");
  const canWriteNote = capabilities.includes("record_clinical_note");
  const canWriteNursing = capabilities.includes("record_nursing_note");
  const canDocument =
    canWriteComplaint ||
    canWriteHpi ||
    canWriteExam ||
    canWriteNote ||
    canWriteNursing;

  const isContextLoading =
    workspace.timeline.isLoading || historySummary.isLoading;

  const lastComplaints = chartSummary?.last_chief_complaints ?? [];
  const problems = (chartSummary?.problem_list ?? []).filter(
    (item) => item.status !== "inactive" && item.status !== "resolved",
  );
  const currentMedications = (chartSummary?.current_medications ?? []).filter(
    (medication) => medication.status === "active",
  );
  const openOrders = (chartSummary?.open_orders ?? []).filter(
    (order) => order.status !== "CANCELLED",
  );
  const investigations = (chartSummary?.investigation_orders ?? []).filter(
    (order) => order.status !== "CANCELLED",
  );
  const recentEncounters = historySummary.data?.recent_encounters ?? [];
  const recentEvents = selectRecentOpdTimelineEvents(workspace.timeline.data);
  const canViewActivity = visibleTabIds.includes("activity");
  const thisEncounterVitals =
    chartSummary?.this_encounter_vitals ?? workspace.observations.data ?? [];
  const lastVisitVitals = chartSummary?.last_vitals ?? [];
  const isFirstVisitEmpty =
    thisEncounterVitals.length === 0 &&
    lastVisitVitals.length === 0 &&
    lastComplaints.length === 0 &&
    problems.length === 0 &&
    currentMedications.length === 0 &&
    openOrders.length === 0 &&
    investigations.length === 0 &&
    recentEncounters.length === 0;

  return (
    <div className="space-y-8" data-testid="opd-overview-tab-panel">
      <OpdConsultChart visitUuid={visitUuid} encounterUuid={encounterUuid} />

      {isContextLoading ? <OpdEncounterTabSkeleton rows={3} /> : null}

      {!isContextLoading && !canDocument && isFirstVisitEmpty ? (
        <p className="text-sm text-dash-muted" data-testid="opd-overview-empty">
          First visit. Record vital signs or a complaint to start the chart.
        </p>
      ) : null}

      <section aria-labelledby="opd-overview-activity-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="opd-overview-activity-heading"
            className="text-sm font-semibold text-brand-navy"
          >
            Recent activity
          </h2>
          {canViewActivity ? (
            <Link
              href={opdEncounterTabHref(visitUuid, encounterUuid, "activity")}
              className="text-sm text-brand-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>
        <div className="mt-3">
          <OpdEncounterActivityLog
            events={recentEvents}
            emptyTitle="Nothing recorded yet"
            emptyDescription="Vital signs, notes, orders, and diagnoses will show up here."
            data-testid="opd-overview-activity"
          />
        </div>
      </section>
    </div>
  );
}
