"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  OpdConsultColumnHeader,
} from "@/features/clinical-opd/components/detail/OpdConsultColumnHeader";
import { useOhVisitHistory } from "@/features/occupational-health/hooks/use-occupational-health";
import type {
  FitnessAssessment,
  FitnessCertificate,
  IodCase,
  OhExamFinding,
  OhExamination,
  OhHistoryVisit,
  OhVisitHistory,
} from "@/features/occupational-health/types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

export const OH_HISTORY_SECTIONS = [
  { id: "exam", label: "Exam" },
  { id: "findings", label: "Findings" },
  { id: "fitness", label: "Fitness" },
  { id: "iod", label: "IOD" },
] as const;

export type OhHistorySectionId = (typeof OH_HISTORY_SECTIONS)[number]["id"];

type OhClinicalHistoryPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  /** Default section focused for the active consult tab. */
  section?: OhHistorySectionId;
  embedded?: boolean;
};

function HistoryEmptyState({ message }: { message: string }) {
  return <p className="px-1 py-6 text-sm text-dash-muted">{message}</p>;
}

function visitLabel(visit: OhHistoryVisit): string {
  if (visit.visit_date) {
    return formatDisplayDate(visit.visit_date);
  }
  if (visit.started_at) {
    return formatDisplayDate(visit.started_at);
  }
  return "Previous visit";
}

function ExamList({ examinations }: { examinations: OhExamination[] }) {
  if (examinations.length === 0) {
    return <HistoryEmptyState message="No examinations on this visit." />;
  }
  return (
    <ul className="space-y-2">
      {examinations.map((exam) => (
        <li
          key={exam.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="text-xs font-semibold capitalize text-brand-navy">
            {exam.exam_type.replaceAll("_", " ")}
          </p>
          {exam.examined_at ? (
            <p className="mt-0.5 text-[10px] text-brand-muted">
              {formatDisplayDateTime(exam.examined_at)}
            </p>
          ) : null}
          {exam.notes ? (
            <p className="mt-1 line-clamp-4 text-sm text-brand-slate">
              {exam.notes}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FindingsList({ findings }: { findings: OhExamFinding[] }) {
  if (findings.length === 0) {
    return <HistoryEmptyState message="No findings on this visit." />;
  }
  return (
    <ul className="space-y-2">
      {findings.map((finding) => (
        <li
          key={finding.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="text-xs font-semibold text-brand-navy">{finding.code}</p>
          <p className="mt-0.5 text-sm text-brand-slate">
            {[finding.numeric_value, finding.unit, finding.coded_value]
              .filter(Boolean)
              .join(" ") || "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {formatDisplayDateTime(finding.recorded_at)}
            {finding.threshold_flag && finding.threshold_flag !== "none"
              ? ` · ${finding.threshold_flag}`
              : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

function FitnessList({
  assessments,
  certificates,
}: {
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
}) {
  if (assessments.length === 0 && certificates.length === 0) {
    return <HistoryEmptyState message="No fitness records on this visit." />;
  }
  const certificatesByAssessment = new Map(
    certificates.map((certificate) => [certificate.assessment, certificate]),
  );
  return (
    <ul className="space-y-2">
      {assessments.map((assessment) => {
        const certificate = certificatesByAssessment.get(assessment.id);
        return (
          <li
            key={assessment.uuid}
            className="border-b border-dash-border/70 py-3 last:border-b-0"
          >
            <p className="text-xs font-semibold capitalize text-brand-navy">
              {assessment.outcome.replaceAll("_", " ")}
            </p>
            <p className="mt-0.5 text-[10px] text-brand-muted">
              {formatDisplayDateTime(assessment.assessed_at)}
              {assessment.review_date
                ? ` · review ${formatDisplayDate(assessment.review_date)}`
                : null}
            </p>
            {certificate ? (
              <p className="mt-1 text-[11px] text-brand-slate">
                Certificate {certificate.status}
                {certificate.valid_to
                  ? ` · valid to ${formatDisplayDate(certificate.valid_to)}`
                  : null}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function IodList({ iodCases }: { iodCases: IodCase[] }) {
  if (iodCases.length === 0) {
    return <HistoryEmptyState message="No IOD cases on this visit." />;
  }
  return (
    <ul className="space-y-2">
      {iodCases.map((iodCase) => (
        <li
          key={iodCase.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="text-xs font-semibold capitalize text-brand-navy">
            {iodCase.severity}
            {iodCase.she_reference ? ` · ${iodCase.she_reference}` : null}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {formatDisplayDate(iodCase.onset_date)} · {iodCase.status}
          </p>
          {iodCase.description ? (
            <p className="mt-1 line-clamp-3 text-sm text-brand-slate">
              {iodCase.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function SectionBody({
  section,
  history,
}: {
  section: OhHistorySectionId;
  history: OhVisitHistory;
}) {
  switch (section) {
    case "exam":
      return <ExamList examinations={history.examinations} />;
    case "findings":
      return <FindingsList findings={history.findings} />;
    case "fitness":
      return (
        <FitnessList
          assessments={history.fitness_assessments}
          certificates={history.fitness_certificates}
        />
      );
    case "iod":
      return <IodList iodCases={history.iod_cases} />;
    default:
      return null;
  }
}

export function OhClinicalHistoryPanel({
  visitUuid,
  encounterUuid,
  section: sectionProp = "exam",
  embedded = true,
}: OhClinicalHistoryPanelProps) {
  const [picked, setPicked] = useState<{
    forSection: OhHistorySectionId;
    id: OhHistorySectionId;
  } | null>(null);
  const section =
    picked && picked.forSection === sectionProp ? picked.id : sectionProp;
  const sectionLabel =
    OH_HISTORY_SECTIONS.find((item) => item.id === section)?.label ?? "History";

  const [historyEncounterUuid, setHistoryEncounterUuid] = useState<
    string | null
  >(null);

  const historyQuery = useOhVisitHistory(
    visitUuid,
    encounterUuid,
    historyEncounterUuid,
  );
  const history = historyQuery.data;
  const visits = useMemo(() => history?.visits ?? [], [history?.visits]);
  const selectedEncounterUuid =
    history?.selected_encounter_uuid ?? historyEncounterUuid;
  const selectedIndex = useMemo(() => {
    if (!selectedEncounterUuid) {
      return -1;
    }
    return visits.findIndex(
      (visit) => visit.encounter_uuid === selectedEncounterUuid,
    );
  }, [selectedEncounterUuid, visits]);

  const selectedVisit =
    selectedIndex >= 0 ? visits[selectedIndex] : (visits[0] ?? null);
  const canGoNewer = selectedIndex > 0;
  const canGoOlder =
    selectedIndex >= 0 ? selectedIndex < visits.length - 1 : false;

  function goToRelativeVisit(delta: number) {
    if (selectedIndex < 0) {
      return;
    }
    const next = visits[selectedIndex + delta];
    if (next) {
      setHistoryEncounterUuid(next.encounter_uuid);
    }
  }

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col bg-dash-canvas",
        embedded
          ? "h-full border-t border-dash-border/70 xl:border-l xl:border-t-0"
          : "border-t border-dash-border/70 xl:sticky xl:top-0 xl:max-h-[calc(100vh-4rem)] xl:border-l xl:border-t-0",
      )}
      data-testid="oh-history-panel"
    >
      <OpdConsultColumnHeader
        eyebrow={`Previous ${sectionLabel.toLowerCase()}`}
        title={
          selectedVisit
            ? [visitLabel(selectedVisit), selectedVisit.department]
                .filter(Boolean)
                .join(" · ")
            : "No earlier visits"
        }
        meta={
          visits.length > 0 ? (
            <span className="shrink-0 text-[11px] tabular-nums text-brand-muted">
              {Math.max(selectedIndex, 0) + 1} of {visits.length}
            </span>
          ) : null
        }
        action={
          <div className="flex divide-x divide-dash-border/70 overflow-hidden rounded-md border border-dash-border/70 bg-white">
            <button
              type="button"
              aria-label="Newer visit"
              disabled={!canGoNewer || historyQuery.isLoading}
              onClick={() => goToRelativeVisit(-1)}
              className={cn(
                "inline-flex size-7 items-center justify-center text-brand-navy transition-colors",
                canGoNewer && !historyQuery.isLoading
                  ? "hover:bg-slate-50 hover:text-brand-primary"
                  : "cursor-not-allowed text-brand-muted opacity-50",
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Older visit"
              disabled={!canGoOlder || historyQuery.isLoading}
              onClick={() => goToRelativeVisit(1)}
              className={cn(
                "inline-flex size-7 items-center justify-center text-brand-navy transition-colors",
                canGoOlder && !historyQuery.isLoading
                  ? "hover:bg-slate-50 hover:text-brand-primary"
                  : "cursor-not-allowed text-brand-muted opacity-50",
              )}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        }
        className="bg-dash-canvas"
      />

      <div
        className="flex flex-wrap gap-1 border-b border-dash-border/70 px-4 py-2 sm:px-5"
        role="tablist"
        aria-label="History sections"
      >
        {OH_HISTORY_SECTIONS.map((item) => {
          const isActive = item.id === section;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                setPicked({ forSection: sectionProp, id: item.id })
              }
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "bg-white text-brand-navy shadow-2xs ring-1 ring-dash-border/80"
                  : "text-brand-muted hover:bg-white/70 hover:text-brand-navy",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
        {historyQuery.isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : historyQuery.isError ? (
          <HistoryEmptyState message="Couldn't load occupational health history. You may need membership of the OH department." />
        ) : visits.length === 0 ? (
          <HistoryEmptyState message="No earlier occupational health visits for this client." />
        ) : history ? (
          <SectionBody section={section} history={history} />
        ) : null}
      </div>
    </aside>
  );
}
