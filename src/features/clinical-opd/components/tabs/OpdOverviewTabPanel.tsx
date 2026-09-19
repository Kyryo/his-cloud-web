"use client";

import type { ReactNode } from "react";
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
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

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
  const lastHpis = chartSummary?.last_hpis ?? [];
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
          First visit. Record vitals or a complaint to start the chart.
        </p>
      ) : null}

      {!isContextLoading && lastComplaints.length > 0 ? (
        <OverviewList
          id="complaint"
          title="Last visit complaint"
          href={
            visibleTabIds.includes("complaint")
              ? opdEncounterTabHref(visitUuid, encounterUuid, "complaint")
              : undefined
          }
        >
          {lastComplaints.map((complaint) => (
            <li key={complaint.uuid}>
              <p className="text-sm font-medium text-brand-navy">
                {complaint.text}
              </p>
              <p className="mt-0.5 text-xs text-dash-muted">
                {formatDisplayDateTime(complaint.recorded_at)}
                {complaint.has_hpi ? " · HPI on file" : ""}
              </p>
            </li>
          ))}
          {lastHpis.map((hpi) => (
            <li key={hpi.uuid}>
              <p className="line-clamp-3 text-sm text-brand-slate">{hpi.body}</p>
            </li>
          ))}
        </OverviewList>
      ) : null}

      {!isContextLoading && problems.length > 0 ? (
        <OverviewList
          id="problems"
          title="Problem list"
          href={
            visibleTabIds.includes("problems")
              ? opdEncounterTabHref(visitUuid, encounterUuid, "problems")
              : undefined
          }
        >
          {problems.map((problem) => (
            <li key={problem.uuid} className="text-sm text-brand-navy">
              {problem.description}
            </li>
          ))}
        </OverviewList>
      ) : null}

      {!isContextLoading && currentMedications.length > 0 ? (
        <OverviewList
          id="current-meds"
          title="Current medications"
          href={
            visibleTabIds.includes("medications")
              ? opdEncounterTabHref(visitUuid, encounterUuid, "medications")
              : undefined
          }
        >
          {currentMedications.map((medication) => (
            <li key={medication.uuid} className="text-sm text-brand-navy">
              {[medication.name, medication.dose, medication.frequency]
                .filter(Boolean)
                .join(" · ")}
            </li>
          ))}
        </OverviewList>
      ) : null}

      {!isContextLoading &&
      (openOrders.length > 0 || investigations.length > 0) ? (
        <OverviewList
          id="orders"
          title="Open orders"
          href={
            visibleTabIds.includes("orders")
              ? opdEncounterTabHref(visitUuid, encounterUuid, "orders")
              : undefined
          }
        >
          {[...openOrders, ...investigations].map((order) => (
            <li key={order.uuid} className="text-sm text-brand-navy">
              {order.description || order.item_type_display}
              {order.status_display ? ` · ${order.status_display}` : ""}
            </li>
          ))}
        </OverviewList>
      ) : null}

      {!isContextLoading && recentEncounters.length > 0 ? (
        <OverviewList id="history" title="Recent encounters">
          {recentEncounters.map((encounter) => (
            <li
              key={encounter.encounter_uuid}
              className="text-sm text-brand-navy"
            >
              {[
                encounter.department,
                encounter.status,
                encounter.started_at
                  ? formatDisplayDateTime(encounter.started_at)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </li>
          ))}
        </OverviewList>
      ) : null}

      <section aria-labelledby="opd-overview-activity-heading">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="opd-overview-activity-heading"
            className="text-base font-semibold tracking-tight text-brand-navy"
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
        <div className="mt-4">
          <OpdEncounterActivityLog
            events={recentEvents}
            emptyTitle="Nothing recorded yet"
            emptyDescription="Vitals, notes, orders, and diagnoses will show up here."
            data-testid="opd-overview-activity"
          />
        </div>
      </section>
    </div>
  );
}

function OverviewList({
  id,
  title,
  href,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`opd-overview-${id}-heading`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={`opd-overview-${id}-heading`}
          className="text-base font-semibold tracking-tight text-brand-navy"
        >
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="text-sm text-brand-primary hover:underline"
          >
            Open
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3">{children}</ul>
    </section>
  );
}
