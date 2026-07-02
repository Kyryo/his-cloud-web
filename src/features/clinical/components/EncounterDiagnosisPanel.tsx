"use client";

import { Loader2, Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddEncounterDiagnosisDialog } from "@/features/clinical/components/AddEncounterDiagnosisDialog";
import { EditEncounterDiagnosisDialog } from "@/features/clinical/components/EditEncounterDiagnosisDialog";
import {
  deleteEncounterDiagnosis,
  fetchEncounterDiagnoses,
} from "@/features/clinical/services/clinical-diagnosis.service";
import type { EncounterDiagnosis } from "@/features/clinical/types/clinical-diagnosis.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EncounterDiagnosisPanelProps = {
  visitUuid: string | null;
  encounterUuid: string | null;
  onDiagnosesChanged?: () => void | Promise<void>;
  className?: string;
};

export function EncounterDiagnosisPanel({
  visitUuid,
  encounterUuid,
  onDiagnosesChanged,
  className,
}: EncounterDiagnosisPanelProps) {
  const { toast } = useToast();
  const [diagnoses, setDiagnoses] = useState<EncounterDiagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<EncounterDiagnosis | null>(null);
  const [deletingDiagnosis, setDeletingDiagnosis] = useState<EncounterDiagnosis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="size-4 text-brand-muted" aria-hidden="true" />
          <h3 className="text-sm font-medium text-brand-navy">Encounter diagnoses</h3>
        </div>
        <PrimaryButton type="button" onClick={() => setAddDialogOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add diagnosis
        </PrimaryButton>
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
                <p className="text-sm text-brand-muted">{diagnosis.description || "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-brand-muted"
                  aria-label={`Edit diagnosis ${diagnosis.code}`}
                  onClick={() => setEditingDiagnosis(diagnosis)}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-brand-muted hover:text-red-700"
                  aria-label={`Delete diagnosis ${diagnosis.code}`}
                  onClick={() => setDeletingDiagnosis(diagnosis)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-brand-muted">
          No diagnoses recorded for this encounter yet.
        </p>
      )}

      <AddEncounterDiagnosisDialog
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        isPrimaryDefault={diagnoses.length === 0}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleDiagnosesChanged}
      />

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
              Remove {deletingDiagnosis?.code} from this encounter? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton type="button" onClick={() => setDeletingDiagnosis(null)}>
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
    </div>
  );
}
