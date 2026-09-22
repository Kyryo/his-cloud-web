"use client";

import { Loader2, Pencil, Plus, Stethoscope, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OpdEncounterRecordList,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { AddEncounterDiagnosisDialog } from "@/features/clinical/components/AddEncounterDiagnosisDialog";
import { EditEncounterDiagnosisDialog } from "@/features/clinical/components/EditEncounterDiagnosisDialog";
import {
  deleteEncounterDiagnosis,
  fetchEncounterDiagnoses,
} from "@/features/clinical/services/clinical-diagnosis.service";
import type {
  EncounterDiagnosis,
  EncounterDiagnosisSourcePlatform,
} from "@/features/clinical/types/clinical-diagnosis.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EncounterDiagnosisPanelProps = {
  visitUuid: string | null;
  encounterUuid: string | null;
  sourcePlatform?: EncounterDiagnosisSourcePlatform;
  onDiagnosesChanged?: () => void | Promise<void>;
  readOnly?: boolean;
  hideAddButton?: boolean;
  /** Consult workspace list styling (orders-like cards). */
  variant?: "default" | "consult";
  className?: string;
};

export function EncounterDiagnosisPanel({
  visitUuid,
  encounterUuid,
  sourcePlatform = "CLINICAL",
  onDiagnosesChanged,
  readOnly = false,
  hideAddButton = false,
  variant = "default",
  className,
}: EncounterDiagnosisPanelProps) {
  const { toast } = useToast();
  const [diagnoses, setDiagnoses] = useState<EncounterDiagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] =
    useState<EncounterDiagnosis | null>(null);
  const [deletingDiagnosis, setDeletingDiagnosis] =
    useState<EncounterDiagnosis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isConsult = variant === "consult";

  const loadDiagnoses = useCallback(async () => {
    if (!visitUuid || !encounterUuid) {
      setDiagnoses([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchEncounterDiagnoses(visitUuid, encounterUuid);
      setDiagnoses(results);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not load diagnoses",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [encounterUuid, toast, visitUuid]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!visitUuid || !encounterUuid) {
        if (!cancelled) {
          setDiagnoses([]);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const results = await fetchEncounterDiagnoses(visitUuid, encounterUuid);
        if (!cancelled) {
          setDiagnoses(results);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Could not load diagnoses",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [encounterUuid, toast, visitUuid]);

  async function handleDiagnosesChanged() {
    await loadDiagnoses();
    await onDiagnosesChanged?.();
  }

  async function handleDeleteDiagnosis() {
    if (!deletingDiagnosis) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEncounterDiagnosis(deletingDiagnosis.uuid);
      toast({
        variant: "success",
        title: "Diagnosis removed",
        description: `${deletingDiagnosis.code} was deleted.`,
      });
      setDeletingDiagnosis(null);
      await handleDiagnosesChanged();
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
      toast({
        variant: "error",
        title: "Could not delete diagnosis",
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!visitUuid || !encounterUuid) {
    return (
      <div className={className}>
        <p className="text-sm text-brand-muted">
          Link this invoice to a visit encounter before recording diagnoses.
        </p>
      </div>
    );
  }

  const dialogs = (
    <>
      <AddEncounterDiagnosisDialog
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        isPrimaryDefault={diagnoses.length === 0}
        sourcePlatform={sourcePlatform}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDiagnosesChanged}
      />

      {!isConsult ? (
        <EditEncounterDiagnosisDialog
          diagnosis={editingDiagnosis}
          open={editingDiagnosis != null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDiagnosis(null);
            }
          }}
          onSuccess={handleDiagnosesChanged}
        />
      ) : null}

      <Dialog
        open={deletingDiagnosis != null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDiagnosis(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Delete diagnosis</DialogTitle>
            <DialogDescription>
              Remove {deletingDiagnosis?.code} from this encounter? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              onClick={() => setDeletingDiagnosis(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDeleteDiagnosis()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete diagnosis"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (isConsult) {
    if (isLoading) {
      return (
        <div className={cn("flex items-center gap-2 text-sm text-brand-muted", className)}>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading diagnoses...
        </div>
      );
    }

    if (diagnoses.length === 0) {
      return (
        <div className={className}>
          <OpdEncounterTabEmptyState
            icon={Stethoscope}
            title="No diagnoses yet"
            description="Diagnoses you save on the left will show up here for this visit."
            data-testid="opd-diagnoses-empty-state"
          />
          {dialogs}
        </div>
      );
    }

    return (
      <div className={className}>
        <OpdEncounterRecordList
          title="This visit"
          data-testid="opd-diagnoses-list"
        >
          {diagnoses.map((diagnosis) => {
            const recordedAt = diagnosis.created_at;
            return (
              <li
                key={diagnosis.uuid}
                className="px-4 py-2.5 sm:px-5"
                data-testid={`opd-diagnosis-item-${diagnosis.uuid}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {diagnosis.description || diagnosis.code}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {diagnosis.is_primary ? (
                        <Badge variant="secondary">Primary</Badge>
                      ) : null}
                      <Badge variant="outline">{diagnosis.code}</Badge>
                      {diagnosis.status ? (
                        <Badge variant="outline" className="capitalize">
                          {diagnosis.status.toLowerCase()}
                        </Badge>
                      ) : null}
                      {recordedAt ? (
                        <span className="inline-flex flex-wrap items-baseline gap-x-2 text-xs text-brand-muted">
                          <time dateTime={recordedAt}>
                            {formatDisplayDateTime(recordedAt)}
                          </time>
                          {diagnosis.created_by_name ? (
                            <>
                              <span
                                className="text-dash-muted"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                              <span>{diagnosis.created_by_name}</span>
                            </>
                          ) : null}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {readOnly ? null : (
                    <SecondaryButton
                      type="button"
                      size="icon"
                      className="size-7 shrink-0 rounded-full text-brand-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete diagnosis ${diagnosis.code}`}
                      data-testid={`opd-diagnosis-delete-${diagnosis.uuid}`}
                      onClick={() => setDeletingDiagnosis(diagnosis)}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </SecondaryButton>
                  )}
                </div>
              </li>
            );
          })}
        </OpdEncounterRecordList>
        {dialogs}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 text-brand-muted" aria-hidden="true" />
          <h3 className="text-sm font-medium text-brand-navy">
            Encounter diagnoses
          </h3>
        </div>
        {readOnly || hideAddButton ? null : (
          <PrimaryButton type="button" onClick={() => setAddDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Add diagnosis
          </PrimaryButton>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading diagnoses...
        </div>
      ) : diagnoses.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {diagnoses.map((diagnosis) => (
            <li
              key={diagnosis.uuid}
              className="flex items-start justify-between gap-3 rounded-lg border border-brand-border bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-medium text-brand-navy">
                  {diagnosis.code}
                  {diagnosis.is_primary ? (
                    <span className="ml-2 text-xs font-normal text-brand-muted">
                      Primary
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-brand-muted">
                  {diagnosis.description || "—"}
                </p>
              </div>
              {readOnly ? null : (
                <div className="flex shrink-0 items-center gap-1">
                  <SecondaryButton
                    type="button"
                    size="icon"
                    className="size-8 rounded-full"
                    aria-label={`Edit diagnosis ${diagnosis.code}`}
                    onClick={() => setEditingDiagnosis(diagnosis)}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    size="icon"
                    className="size-8 rounded-full text-brand-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete diagnosis ${diagnosis.code}`}
                    onClick={() => setDeletingDiagnosis(diagnosis)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </SecondaryButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-brand-muted">
          No diagnoses recorded for this encounter yet.
        </p>
      )}

      {dialogs}
    </div>
  );
}
