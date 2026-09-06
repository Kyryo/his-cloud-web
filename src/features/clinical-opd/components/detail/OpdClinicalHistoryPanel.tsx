"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterClinicalHistory } from "@/features/clinical-opd/hooks/use-clinical-opd";
import type {
  ClinicalHistoryNote,
  ClinicalHistoryVisit,
  ClinicalVisitHistory,
  EncounterClinicalOrder,
  EncounterPrescription,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

type HistorySectionId = "notes" | "orders" | "diagnoses" | "medications";

const HISTORY_SECTIONS: Array<{ id: HistorySectionId; label: string }> = [
  { id: "notes", label: "Notes" },
  { id: "orders", label: "Orders" },
  { id: "diagnoses", label: "Diagnoses" },
  { id: "medications", label: "Treatment" },
];

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
    <p className="px-1 py-6 text-center text-xs text-brand-muted">{message}</p>
  );
}

function NotesList({ notes }: { notes: ClinicalHistoryNote[] }) {
  if (notes.length === 0) {
    return <HistoryEmptyState message="No notes on this visit." />;
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={`${note.kind}-${note.uuid}`}
          className="rounded-lg border border-dash-border/70 bg-dash-canvas/40 px-3 py-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold capitalize text-brand-navy">
              {note.title.replaceAll("_", " ")}
            </p>
            {note.occurred_at ? (
              <time className="shrink-0 text-[10px] text-brand-muted">
                {formatDisplayDateTime(note.occurred_at)}
              </time>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-brand-slate">
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
          className="rounded-lg border border-dash-border/70 bg-dash-canvas/40 px-3 py-2.5"
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
          className="rounded-lg border border-dash-border/70 bg-dash-canvas/40 px-3 py-2.5"
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
          className="rounded-lg border border-dash-border/70 bg-dash-canvas/40 px-3 py-2.5"
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

export function OpdClinicalHistoryPanel() {
  const { visitUuid, encounterUuid } = useOpdEncounterWorkspace();
  const [section, setSection] = useState<HistorySectionId>("notes");
  const [historyEncounterUuid, setHistoryEncounterUuid] = useState<
    string | null
  >(null);

  const historyQuery = useEncounterClinicalHistory(
    visitUuid,
    encounterUuid,
    historyEncounterUuid,
  );
  const history = historyQuery.data;

  const visits = history?.visits ?? [];
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
      className="flex min-h-0 flex-col border-t border-dash-border/80 bg-white xl:sticky xl:top-0 xl:max-h-[calc(100vh-4rem)] xl:border-l xl:border-t-0"
      data-testid="opd-clinical-history-panel"
    >
      <div className="flex items-center justify-between gap-2 border-b border-dash-border/80 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            History
          </p>
          <p className="truncate text-sm font-semibold text-brand-navy">
            {selectedVisit ? visitLabel(selectedVisit) : "Previous visits"}
          </p>
          {selectedVisit?.department ? (
            <p className="truncate text-[11px] text-brand-muted">
              {selectedVisit.department}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Newer visit"
            disabled={!canGoNewer || historyQuery.isLoading}
            onClick={() => goToRelativeVisit(-1)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border border-dash-border text-brand-navy transition-colors",
              canGoNewer
                ? "hover:border-brand-border hover:bg-dash-canvas"
                : "cursor-not-allowed opacity-40",
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
              "inline-flex size-8 items-center justify-center rounded-md border border-dash-border text-brand-navy transition-colors",
              canGoOlder
                ? "hover:border-brand-border hover:bg-dash-canvas"
                : "cursor-not-allowed opacity-40",
            )}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-1.5 border-b border-dash-border/80 px-3 py-2.5 sm:px-4"
        role="tablist"
        aria-label="Clinical history sections"
        data-testid="opd-clinical-history-section-tabs"
      >
        {HISTORY_SECTIONS.map((option) => {
          const isSelected = section === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSection(option.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                isSelected
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-dash-border bg-white text-brand-muted hover:border-brand-border hover:text-brand-navy",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
        {historyQuery.isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <HistoryEmptyState message="No previous visits for this client." />
        ) : section === "notes" ? (
          <NotesList notes={history?.notes ?? []} />
        ) : section === "orders" ? (
          <OrdersList orders={history?.orders ?? []} />
        ) : section === "diagnoses" ? (
          <DiagnosesList diagnoses={history?.diagnoses ?? []} />
        ) : (
          <MedicationsList medications={history?.medications ?? []} />
        )}
      </div>
    </aside>
  );
}
