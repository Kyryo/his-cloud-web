"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OpdConsultColumnHeader } from "@/features/clinical-opd/components/detail/OpdConsultColumnHeader";
import { OpdVitalSetCard } from "@/features/clinical-opd/components/detail/OpdVitalSetCard";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterClinicalHistory } from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { OpdHistorySectionId } from "@/features/clinical-opd/utils/opd-physician-history-tabs";
import { groupObservationsIntoVitalSets } from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type {
  ClinicalHistoryNote,
  ClinicalHistoryVisit,
  ClinicalVisitHistory,
  EncounterClinicalOrder,
  EncounterObservation,
  EncounterPrescription,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

const HISTORY_SECTIONS: Array<{ id: OpdHistorySectionId; label: string }> = [
  { id: "complaint", label: "Complaints" },
  { id: "exam", label: "Exam" },
  { id: "orders", label: "Orders" },
  { id: "investigations", label: "Investigations" },
  { id: "diagnoses", label: "Diagnoses" },
  { id: "medications", label: "Medication" },
  { id: "nursing", label: "Nurse's notes" },
  { id: "vitals", label: "Vitals" },
];

const DEFAULT_ALLOWED_SECTIONS: OpdHistorySectionId[] = [
  "complaint",
  "exam",
  "orders",
  "diagnoses",
  "medications",
];

const NOTE_KIND_LABELS: Record<string, string> = {
  chief_complaint: "Chief complaint",
  hpi: "HPI",
  physical_exam: "Examination",
  clinical_note: "Clinical note",
  nursing_note: "Nursing note",
};

function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function visitLabel(visit: ClinicalHistoryVisit): string {
  if (visit.visit_date) {
    return formatDisplayDate(visit.visit_date);
  }
  if (visit.started_at) {
    return formatDisplayDate(visit.started_at);
  }
  return "Previous visit";
}

function HistoryEmptyState({ message }: { message: string }) {
  return (
    <p className="px-1 py-6 text-sm text-dash-muted">{message}</p>
  );
}

function complaintHistoryNotes(
  history: ClinicalVisitHistory | undefined,
): ClinicalHistoryNote[] {
  const fromNotes = (history?.notes ?? []).filter(
    (note) => note.kind === "chief_complaint" || note.kind === "hpi",
  );
  const fromComplaints = (history?.chief_complaints ?? []).map((complaint) => ({
    kind: "chief_complaint" as const,
    uuid: complaint.uuid,
    title: "Chief complaint",
    body: complaint.text,
    occurred_at: complaint.recorded_at,
    recorded_by_name: complaint.recorded_by_name,
  }));
  const fromHpis = (history?.hpis ?? []).map((hpi) => ({
    kind: "hpi" as const,
    uuid: hpi.uuid,
    title: "HPI",
    body: hpi.body,
    occurred_at: hpi.recorded_at,
    recorded_by_name: hpi.recorded_by_name,
  }));

  const seen = new Set(fromNotes.map((note) => note.uuid));
  return [
    ...fromNotes,
    ...fromComplaints.filter((item) => !seen.has(item.uuid)),
    ...fromHpis.filter((item) => !seen.has(item.uuid)),
  ];
}

function NotesList({
  notes,
  emptyMessage = "No notes on this visit.",
}: {
  notes: ClinicalHistoryNote[];
  emptyMessage?: string;
}) {
  if (notes.length === 0) {
    return <HistoryEmptyState message={emptyMessage} />;
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={`${note.kind}-${note.uuid}`}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold capitalize text-brand-navy">
              {NOTE_KIND_LABELS[note.kind] ?? note.title.replaceAll("_", " ")}
            </p>
            {note.occurred_at ? (
              <time className="shrink-0 text-[10px] text-brand-muted">
                {formatDisplayDateTime(note.occurred_at)}
              </time>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-brand-slate">
            {plainTextFromHtml(note.body) || "—"}
          </p>
          {note.recorded_by_name ? (
            <p className="mt-1.5 text-[10px] text-brand-muted">
              {note.recorded_by_name}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function OrdersList({ orders }: { orders: EncounterClinicalOrder[] }) {
  if (orders.length === 0) {
    return <HistoryEmptyState message="No orders on this visit." />;
  }

  return (
    <ul className="space-y-2">
      {orders.map((order) => (
        <li
          key={order.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="text-xs font-semibold text-brand-navy">
            {order.description || order.item_type_display}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {order.item_type_display}
            {order.status_display ? ` · ${order.status_display}` : null}
          </p>
        </li>
      ))}
    </ul>
  );
}

function InvestigationsList({ orders }: { orders: EncounterClinicalOrder[] }) {
  const investigationOrders = orders.filter((order) => {
    const type = order.item_type?.toUpperCase();
    return type === "LABORATORY" || type === "RADIOLOGY";
  });

  if (investigationOrders.length === 0) {
    return (
      <HistoryEmptyState message="No lab or radiology orders on this visit." />
    );
  }

  return <OrdersList orders={investigationOrders} />;
}

function DiagnosesList({
  diagnoses,
}: {
  diagnoses: ClinicalVisitHistory["diagnoses"];
}) {
  if (diagnoses.length === 0) {
    return <HistoryEmptyState message="No diagnoses on this visit." />;
  }

  return (
    <ul className="space-y-2">
      {diagnoses.map((diagnosis) => (
        <li
          key={diagnosis.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="font-mono text-xs font-semibold text-brand-navy">
            {diagnosis.code}
            {diagnosis.is_primary ? (
              <span className="ml-1.5 rounded bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-primary">
                Primary
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-brand-slate">
            {diagnosis.description || "—"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MedicationsList({
  medications,
}: {
  medications: EncounterPrescription[];
}) {
  if (medications.length === 0) {
    return (
      <HistoryEmptyState message="No treatment on this visit." />
    );
  }

  return (
    <ul className="space-y-2">
      {medications.map((medication) => (
        <li
          key={medication.uuid}
          className="border-b border-dash-border/70 py-3 last:border-b-0"
        >
          <p className="text-xs font-semibold text-brand-navy">
            {medication.product_name}
          </p>
          <p className="mt-0.5 text-[10px] text-brand-muted">
            {[medication.dose, medication.frequency, medication.duration]
              .filter(Boolean)
              .join(" · ") || medication.status}
          </p>
          {medication.instructions ? (
            <p className="mt-1 line-clamp-2 text-xs text-brand-slate">
              {medication.instructions}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function VitalsList({ observations }: { observations: EncounterObservation[] }) {
  const sets = groupObservationsIntoVitalSets(observations);

  if (sets.length === 0) {
    return <HistoryEmptyState message="No vital signs on this visit." />;
  }

  return (
    <ul className="space-y-2.5" data-testid="opd-history-vitals-list">
      {sets.map((set) => (
        <li key={set.id}>
          <OpdVitalSetCard set={set} compact />
        </li>
      ))}
    </ul>
  );
}

type OpdClinicalHistoryPanelProps = {
  section?: OpdHistorySectionId;
  /** Limit which section tabs are available. Defaults to physician consult sections. */
  allowedSections?: readonly OpdHistorySectionId[];
  embedded?: boolean;
};

export function OpdClinicalHistoryPanel({
  section: sectionProp,
  allowedSections = DEFAULT_ALLOWED_SECTIONS,
  embedded = false,
}: OpdClinicalHistoryPanelProps) {
  const { visitUuid, encounterUuid } = useOpdEncounterWorkspace();
  const visibleSections = useMemo(
    () => HISTORY_SECTIONS.filter((item) => allowedSections.includes(item.id)),
    [allowedSections],
  );
  const defaultSection =
    sectionProp && allowedSections.includes(sectionProp)
      ? sectionProp
      : (visibleSections[0]?.id ?? "complaint");
  const [section, setSection] = useState<OpdHistorySectionId>(defaultSection);

  useEffect(() => {
    if (sectionProp && allowedSections.includes(sectionProp)) {
      setSection(sectionProp);
      return;
    }
    setSection((current) =>
      allowedSections.includes(current)
        ? current
        : (visibleSections[0]?.id ?? "complaint"),
    );
  }, [sectionProp, allowedSections, visibleSections]);

  const showSectionNav = visibleSections.length > 1;
  const sectionLabel = visibleSections.find((item) => item.id === section)?.label;
  const eyebrowLabel = sectionLabel
    ? `Previous ${sectionLabel.toLowerCase()}`
    : "Previous visits";
  const [historyEncounterUuid, setHistoryEncounterUuid] = useState<
    string | null
  >(null);

  const historyQuery = useEncounterClinicalHistory(
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
    selectedIndex >= 0 ? visits[selectedIndex] : visits[0] ?? null;
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
      data-testid="opd-clinical-history-panel"
    >
      <OpdConsultColumnHeader
        eyebrow={eyebrowLabel}
        title={
          selectedVisit
            ? [visitLabel(selectedVisit), selectedVisit.department]
                .filter(Boolean)
                .join(" · ")
            : "No earlier visits"
        }
        meta={
          visits.length > 0 ? (
            <span
              className="shrink-0 text-[11px] tabular-nums text-brand-muted"
              data-testid="opd-clinical-history-position"
            >
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
        data-testid="opd-clinical-history-header"
      />

      {showSectionNav ? (
        <div
          className="flex flex-wrap gap-1 border-b border-dash-border/70 px-4 py-2 sm:px-5"
          role="tablist"
          aria-label="History sections"
          data-testid="opd-clinical-history-section-nav"
        >
          {visibleSections.map((item) => {
            const isActive = item.id === section;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSection(item.id)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-white text-brand-navy shadow-2xs ring-1 ring-dash-border/80"
                    : "text-brand-muted hover:bg-white/70 hover:text-brand-navy",
                )}
                data-testid={`opd-history-section-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
        {historyQuery.isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <HistoryEmptyState message="No previous visits for this client." />
        ) : section === "complaint" ? (
          <NotesList
            notes={complaintHistoryNotes(history)}
            emptyMessage="No chief complaint or HPI on this visit."
          />
        ) : section === "exam" ? (
          <NotesList
            notes={(history?.notes ?? []).filter(
              (note) => note.kind === "physical_exam",
            )}
            emptyMessage="No examination findings on this visit."
          />
        ) : section === "orders" ? (
          <OrdersList orders={history?.orders ?? []} />
        ) : section === "investigations" ? (
          <InvestigationsList orders={history?.orders ?? []} />
        ) : section === "diagnoses" ? (
          <DiagnosesList diagnoses={history?.diagnoses ?? []} />
        ) : section === "vitals" ? (
          <VitalsList observations={history?.observations ?? []} />
        ) : section === "nursing" ? (
          <NotesList
            notes={(history?.notes ?? []).filter(
              (note) => note.kind === "nursing_note",
            )}
            emptyMessage="No nursing notes on this visit."
          />
        ) : (
          <MedicationsList medications={history?.medications ?? []} />
        )}
      </div>
    </aside>
  );
}
