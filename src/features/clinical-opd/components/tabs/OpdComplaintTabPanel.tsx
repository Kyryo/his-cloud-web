"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { OpdComplaintComposer } from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
import { OpdEditComplaintDialog } from "@/features/clinical-opd/components/detail/OpdEditComplaintDialog";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useChiefComplaints,
  useDeleteChiefComplaint,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { ChiefComplaint } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatHpiDuration,
  parseHpiBody,
} from "@/features/clinical-opd/utils/hpi-duration";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

type OpdComplaintTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdComplaintTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdComplaintTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const complaints = useChiefComplaints(visitUuid, encounterUuid, isActive);
  const deleteComplaint = useDeleteChiefComplaint(visitUuid, encounterUuid);
  const [editingComplaint, setEditingComplaint] =
    useState<ChiefComplaint | null>(null);
  const canWriteComplaint =
    capabilities.includes("record_chief_complaint") && !isChartLocked;
  const canWriteHpi = capabilities.includes("record_hpi") && !isChartLocked;
  const canEdit = canWriteComplaint || canWriteHpi;

  if (!isActive) return null;
  if (complaints.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = complaints.data ?? [];
  // Prefer the freshest row from the query cache when the dialog is open.
  const dialogComplaint =
    editingComplaint == null
      ? null
      : (items.find((item) => item.uuid === editingComplaint.uuid) ??
        editingComplaint);

  return (
    <>
      <OpdConsultLayout
        historySection="complaint"
        form={
          canWriteComplaint || canWriteHpi ? (
            <OpdConsultFormPanel title="Chief complaint & HPI">
              <OpdComplaintComposer
                visitUuid={visitUuid}
                encounterUuid={encounterUuid}
                complaint={null}
                canWriteComplaint={canWriteComplaint}
                canWriteHpi={canWriteHpi}
              />
            </OpdConsultFormPanel>
          ) : (
            <OpdConsultFormPanel title="Chief complaint & HPI">
              <OpdConsultFormLocked message="You can review complaints for this encounter, but you cannot add or edit them." />
            </OpdConsultFormPanel>
          )
        }
        content={
          <OpdConsultContentPanel
            title="Complaints"
            count={items.length}
            data-testid="opd-complaint-tab-panel"
          >
            {items.length === 0 ? (
              <OpdEncounterTabEmptyState
                icon={MessageSquare}
                title="No chief complaint yet"
                description="Save a complaint on the left. It will appear here for this visit."
              />
            ) : (
              <ul className="space-y-3">
                {items.map((complaint) => (
                  <ComplaintRecordCard
                    key={complaint.uuid}
                    complaint={complaint}
                    selected={dialogComplaint?.uuid === complaint.uuid}
                    onSelect={
                      canEdit ? () => setEditingComplaint(complaint) : undefined
                    }
                  />
                ))}
              </ul>
            )}
          </OpdConsultContentPanel>
        }
      />

      {dialogComplaint ? (
        <OpdEditComplaintDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingComplaint(null);
            }
          }}
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          complaint={dialogComplaint}
          canWriteComplaint={canWriteComplaint}
          canWriteHpi={canWriteHpi}
          onDelete={
            canWriteComplaint
              ? () => {
                  void deleteComplaint.mutateAsync(dialogComplaint.uuid);
                  setEditingComplaint(null);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );
}

function ComplaintRecordCard({
  complaint,
  selected,
  onSelect,
}: {
  complaint: ChiefComplaint;
  selected: boolean;
  onSelect?: () => void;
}) {
  const parsed = parseHpiBody(complaint.hpi?.body);
  const recordedMeta = [
    formatDisplayDateTime(complaint.recorded_at),
    complaint.recorded_by_name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <article
        className={cn(
          "rounded-lg border bg-white px-4 py-3",
          selected ? "border-brand-primary" : "border-dash-border/80",
          onSelect && "cursor-pointer transition-colors hover:border-brand-primary/50",
        )}
        data-testid={`opd-complaint-item-${complaint.uuid}`}
      >
        {onSelect ? (
          <button type="button" className="w-full text-left" onClick={onSelect}>
            <ComplaintRecordBody
              text={complaint.text}
              duration={parsed.duration}
              narrative={parsed.narrative}
              recordedMeta={recordedMeta}
            />
          </button>
        ) : (
          <ComplaintRecordBody
            text={complaint.text}
            duration={parsed.duration}
            narrative={parsed.narrative}
            recordedMeta={recordedMeta}
          />
        )}
      </article>
    </li>
  );
}

function ComplaintRecordBody({
  text,
  duration,
  narrative,
  recordedMeta,
}: {
  text: string;
  duration: ReturnType<typeof parseHpiBody>["duration"];
  narrative: string;
  recordedMeta: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-brand-navy">{text}</p>
        {duration ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-slate">
            {formatHpiDuration(duration)}
          </span>
        ) : null}
      </div>
      {narrative ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-slate">
          {narrative}
        </p>
      ) : (
        <p className="text-sm text-dash-muted">No comment yet</p>
      )}
      {recordedMeta ? (
        <p className="text-xs text-dash-muted">{recordedMeta}</p>
      ) : null}
    </div>
  );
}
