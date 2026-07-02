"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { updateEncounterDiagnosis } from "@/features/clinical/services/clinical-diagnosis.service";
import type { EncounterDiagnosis } from "@/features/clinical/types/clinical-diagnosis.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EditEncounterDiagnosisDialogProps = {
  diagnosis: EncounterDiagnosis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

type EditEncounterDiagnosisFormProps = {
  diagnosis: EncounterDiagnosis;
  onCancel: () => void;
  onSuccess?: () => void | Promise<void>;
};

function EditEncounterDiagnosisForm({
  diagnosis,
  onCancel,
  onSuccess,
}: EditEncounterDiagnosisFormProps) {
  const { toast } = useToast();
  const [code, setCode] = useState(diagnosis.code);
  const [description, setDescription] = useState(diagnosis.description ?? "");
  const [isPrimary, setIsPrimary] = useState(diagnosis.is_primary);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!code.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await updateEncounterDiagnosis(diagnosis.uuid, {
        code: code.trim(),
        description: description.trim(),
        standard: diagnosis.standard,
        is_primary: isPrimary,
      });
      toast({
        variant: "success",
        title: "Diagnosis updated",
        description: `${code.trim()} was saved.`,
      });
      await onSuccess?.();
      onCancel();
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
      toast({
        variant: "error",
        title: "Could not update diagnosis",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-brand-navy">
            Code <RequiredFieldMarker />
          </label>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-1.5 font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">Description</label>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-navy">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(event) => setIsPrimary(event.target.checked)}
            className="size-4 rounded border-brand-border"
          />
          Primary diagnosis
        </label>
      </div>

      <DialogFooter>
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="button"
          disabled={isSaving || !code.trim()}
          onClick={() => void handleSave()}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export function EditEncounterDiagnosisDialog({
  diagnosis,
  open,
  onOpenChange,
  onSuccess,
}: EditEncounterDiagnosisDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Edit diagnosis</DialogTitle>
          <DialogDescription>Update the ICD-10 code and description.</DialogDescription>
        </DialogHeader>

        {open && diagnosis ? (
          <EditEncounterDiagnosisForm
            key={diagnosis.uuid}
            diagnosis={diagnosis}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
