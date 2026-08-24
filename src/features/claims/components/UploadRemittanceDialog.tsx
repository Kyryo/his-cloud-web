"use client";

import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { RemittanceFileDropzone } from "@/features/claims/components/RemittanceFileDropzone";
import { RemittancePayerSelect } from "@/features/claims/components/RemittancePayerSelect";
import { uploadRemittanceBatch } from "@/features/claims/services/remittances.service";
import type { RemittanceBatch } from "@/features/claims/types/remittances.types";

type UploadRemittanceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (batch: RemittanceBatch) => void;
};

export function UploadRemittanceDialog({
  open,
  onOpenChange,
  onUploaded,
}: UploadRemittanceDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [payerCode, setPayerCode] = useState("MASM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) {
      return;
    }
    if (!nextOpen) {
      setFile(null);
      setError(null);
      setPayerCode("MASM");
    }
    onOpenChange(nextOpen);
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Upload remittance"
      description="Upload a remittance advice PDF or CSV/XLSX export. Totals must reconcile before settlements apply."
      data-testid="remittance-upload-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!file || isSubmitting}
            data-testid="remittance-upload-submit"
            onClick={async () => {
              if (!file) {
                return;
              }
              setIsSubmitting(true);
              setError(null);
              try {
                const batch = await uploadRemittanceBatch({
                  file,
                  payerCode,
                });
                setFile(null);
                onUploaded(batch);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Upload failed.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Uploading…" : "Upload"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        <RemittancePayerSelect
          value={payerCode}
          onValueChange={setPayerCode}
          disabled={isSubmitting}
        />
        <RemittanceFileDropzone
          file={file}
          onFileChange={setFile}
          disabled={isSubmitting}
        />
        {error ? (
          <p
            className="text-sm text-destructive"
            data-testid="remittance-upload-error"
          >
            {error}
          </p>
        ) : null}
      </div>
    </SectionedDialog>
  );
}
