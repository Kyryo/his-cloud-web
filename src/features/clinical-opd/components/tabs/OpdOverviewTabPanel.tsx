"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { fetchEncounterDiagnoses } from "@/features/clinical/services/clinical-diagnosis.service";
import { OpdEncounterActivityLog } from "@/features/clinical-opd/components/detail/OpdEncounterActivityLog";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OpdOverviewVitalsSection } from "@/features/clinical-opd/components/tabs/OpdOverviewVitalsSection";
import {
  useEncounterHistorySummary,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  buildOpdOverviewContinueActions,
  buildOpdOverviewWorkItems,
  selectRecentOpdTimelineEvents,
} from "@/features/clinical-opd/utils/opd-encounter-overview";
import { buildOpdEncounterVitalStats } from "@/features/clinical-opd/utils/opd-encounter-vitals";
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
  const { visibleTabIds, capabilities, userRole, chartSummary } =
    useOpdEncounterWorkspace();
  const workspace = useEncounterWorkspace(visitUuid, encounterUuid);
  const historySummary = useEncounterHistorySummary(
    visitUuid,
    encounterUuid,
    isActive,
  );
  const diagnosesQuery = useQuery({
    queryKey: ["encounter-diagnoses", visitUuid, encounterUuid],
    queryFn: () => fetchEncounterDiagnoses(visitUuid, encounterUuid),
    enabled: isActive && visibleTabIds.includes("diagnoses"),
  });

  if (!isActive) {
    return null;
  }

  const isLoading =
    workspace.observations.isLoading ||
    workspace.orders.isLoading ||
    workspace.prescriptions.isLoading ||
    workspace.timeline.isLoading ||
    historySummary.isLoading ||
    (visibleTabIds.includes("diagnoses") && diagnosesQuery.isLoading);

  if (isLoading) {
    return <OpdEncounterTabSkeleton rows={6} />;
  }

  const thisEncounterVitals =
    chartSummary?.this_encounter_vitals ?? workspace.observations.data ?? [];
  const lastVisitVitals = chartSummary?.last_vitals ?? [];
  const vitals = buildOpdEncounterVitalStats(thisEncounterVitals);
  const lastVitals = buildOpdEncounterVitalStats(lastVisitVitals);
  const workItems = buildOpdOverviewWorkItems({
    observations: thisEncounterVitals,
    diagnoses: diagnosesQuery.data,
    orders: workspace.orders.data,
    prescriptions: workspace.prescriptions.data,
    nursingNotes: workspace.nursingNotes.data,
    clinicalNotes: workspace.clinicalNotes.data,
    physicalExams: workspace.physicalExams.data,
    visibleTabIds,
  });
  const continueActions = buildOpdOverviewContinueActions({
    visitUuid,
    encounterUuid,
    visibleTabIds,
    capabilities,
    userRole,
  });
  const recentEvents = selectRecentOpdTimelineEvents(workspace.timeline.data);
  const canViewActivity = visibleTabIds.includes("activity");
  const canViewVitals = visibleTabIds.includes("vital-signs");
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
    <div className="space-y-10" data-testid="opd-overview-tab-panel">
      <OpdOverviewVitalsSection
        vitals={vitals}
        recordHref={
          canViewVitals
            ? opdEncounterTabHref(visitUuid, encounterUuid, "vital-signs")
            : undefined
        }
      />

      {lastVisitVitals.length > 0 ? (
        <OpdOverviewVitalsSection
          vitals={lastVitals}
          title="Last visit vitals"
          headingId="opd-overview-last-vitals-heading"
        />
      ) : null}

      {lastComplaints.length > 0 || lastHpis.length > 0 ? (
        <OverviewList
          id="complaint"
          title="Last complaint"
          href={
            visibleTabIds.includes("complaint")
              ? opdEncounterTabHref(visitUuid, encounterUuid, "complaint")
              : undefined
          }
        >
          {lastComplaints.map((complaint) => (
            <li key={complaint.uuid}>
              <p className="text-sm font-medium text-brand-navy">{complaint.text}</p>
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

      {problems.length > 0 ? (
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

      {currentMedications.length > 0 ? (
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

      {openOrders.length > 0 || investigations.length > 0 ? (
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

      {recentEncounters.length > 0 ? (
        <OverviewList id="history" title="Recent encounters">
          {recentEncounters.map((encounter) => (
            <li key={encounter.encounter_uuid} className="text-sm text-brand-navy">
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

      {isFirstVisitEmpty ? (
        <p className="text-sm text-dash-muted" data-testid="opd-overview-empty">
          First visit. Record vitals or a complaint to start the chart.
        </p>
      ) : null}

      {workItems.length > 0 ? (
        <section aria-labelledby="opd-overview-work-heading">
          <h2
            id="opd-overview-work-heading"
            className="text-base font-semibold tracking-tight text-brand-navy"
          >
            This visit
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
            {workItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={opdEncounterTabHref(visitUuid, encounterUuid, item.key)}
                  className="group block"
                >
                  <p className="text-xs text-dash-muted">{item.label}</p>
                  <p className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums text-brand-navy group-hover:text-brand-primary">
                    {item.count}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {continueActions.length > 0 ? (
        <section aria-labelledby="opd-overview-continue-heading">
          <h2
            id="opd-overview-continue-heading"
            className="text-base font-semibold tracking-tight text-brand-navy"
          >
            Continue
          </h2>
          <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
            {continueActions.map((action) => (
              <li
                key={action.key}
                className="border-t border-dash-border/70 first:border-t-0 sm:[&:nth-child(-n+2)]:border-t-0"
              >
                <Link
                  href={action.href}
                  className="-mx-2 flex items-baseline justify-between gap-4 rounded-lg px-2 py-3.5 hover:bg-brand-tint/50"
                >
                  <span>
                    <span className="block text-sm font-medium text-brand-navy">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-dash-muted">
                      {action.hint}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-brand-primary">
                    Open
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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
  children: React.ReactNode;
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
          <Link href={href} className="text-sm text-brand-primary hover:underline">
            Open
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3">{children}</ul>
    </section>
  );
}
