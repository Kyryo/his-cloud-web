"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useChiefComplaints,
  useCreateChiefComplaint,
  useDeleteChiefComplaint,
  useSaveChiefComplaintHpi,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { chiefComplaintSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

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
  const createComplaint = useCreateChiefComplaint(visitUuid, encounterUuid);
  const deleteComplaint = useDeleteChiefComplaint(visitUuid, encounterUuid);
  const saveHpi = useSaveChiefComplaintHpi(visitUuid, encounterUuid);
  const [open, setOpen] = useState(false);
  const [hpiFor, setHpiFor] = useState<string | null>(null);
  const [hpiBody, setHpiBody] = useState("");
  const canWriteComplaint =
    capabilities.includes("record_chief_complaint") && !isChartLocked;
  const canWriteHpi = capabilities.includes("record_hpi") && !isChartLocked;
  const form = useForm({
    resolver: zodResolver(chiefComplaintSchema),
    defaultValues: { text: "" },
  });

  if (!isActive) return null;
  if (complaints.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = complaints.data ?? [];

  return (
    <div data-testid="opd-complaint-tab-panel">
      {items.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={MessageSquare}
          title="No chief complaint"
          description="The first physician write starts the encounter."
          action={
            canWriteComplaint ? (
              <TabAddActionButton
                label="Add complaint"
                emptyState
                onClick={() => setOpen(true)}
              />
            ) : null
          }
        />
      ) : (
        <OpdEncounterRecordList
          title="Chief complaint"
          action={
            canWriteComplaint ? (
              <TabAddActionButton
                label="Add complaint"
                onClick={() => setOpen(true)}
              />
            ) : null
          }
        >
          {items.map((complaint) => (
            <OpdEncounterRecordListItem
              key={complaint.uuid}
              compact
              icon={MessageSquare}
              title={complaint.text}
              description={
                complaint.hpi?.body ??
                (complaint.has_hpi ? "HPI recorded" : "No HPI yet")
              }
              dateTime={complaint.recorded_at}
              createdByName={complaint.recorded_by_name}
              menuActions={[
                ...(canWriteHpi
                  ? [
                      {
                        label: complaint.has_hpi ? "Edit HPI" : "Add HPI",
                        onClick: () => {
                          setHpiFor(complaint.uuid);
                          setHpiBody(complaint.hpi?.body ?? "");
                        },
                      },
                    ]
                  : []),
                ...(canWriteComplaint
                  ? [
                      {
                        label: "Delete",
                        onClick: () => {
                          void deleteComplaint.mutateAsync(complaint.uuid);
                        },
                      },
                    ]
                  : []),
              ]}
            />
          ))}
        </OpdEncounterRecordList>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chief complaint</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await createComplaint.mutateAsync(values);
              form.reset();
              setOpen(false);
            })}
          >
            <div className="space-y-1.5">
              <Label>
                Complaint <RequiredFieldMarker />
              </Label>
              <Input {...form.register("text")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createComplaint.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(hpiFor)} onOpenChange={(next) => !next && setHpiFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>History of present illness</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!hpiFor) return;
              const complaint = items.find((item) => item.uuid === hpiFor);
              await saveHpi.mutateAsync({
                complaintUuid: hpiFor,
                body: hpiBody,
                hasHpi: Boolean(complaint?.has_hpi || complaint?.hpi),
              });
              setHpiFor(null);
            }}
          >
            <div className="space-y-1.5">
              <Label>
                HPI <RequiredFieldMarker />
              </Label>
              <Textarea
                rows={4}
                value={hpiBody}
                onChange={(event) => setHpiBody(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHpiFor(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveHpi.isPending}>
                Save HPI
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
