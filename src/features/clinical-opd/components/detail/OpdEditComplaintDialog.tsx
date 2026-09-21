"use client";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { OpdComplaintComposer } from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
import type { ChiefComplaint } from "@/features/clinical-opd/types/clinical-opd.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const EDIT_COMPLAINT_FORM_ID = "opd-edit-complaint-form";

type OpdEditComplaintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitUuid: string;
  encounterUuid: string;
  complaint: ChiefComplaint;
  canWriteComplaint: boolean;
  canWriteHpi: boolean;
  onDelete?: () => void;
};

export function OpdEditComplaintDialog({
  open,
  onOpenChange,
  visitUuid,
  encounterUuid,
  complaint,
  canWriteComplaint,
  canWriteHpi,
  onDelete,
}: OpdEditComplaintDialogProps) {
  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit complaint"
      description="Update the chief complaint, duration, and comment."
      className={cn(appFont.className, "sm:max-w-lg")}
      data-testid="opd-edit-complaint-dialog"
      footer={
        <>
          {canWriteComplaint && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto text-destructive hover:bg-transparent hover:text-destructive"
              onClick={onDelete}
              data-testid="opd-edit-complaint-delete"
            >
              Delete
            </Button>
          ) : null}
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={EDIT_COMPLAINT_FORM_ID}>
            Save
          </PrimaryButton>
        </>
      }
    >
      <OpdComplaintComposer
        visitUuid={visitUuid}
        encounterUuid={encounterUuid}
        complaint={complaint}
        canWriteComplaint={canWriteComplaint}
        canWriteHpi={canWriteHpi}
        formId={EDIT_COMPLAINT_FORM_ID}
        showFooterActions={false}
        onSaved={() => onOpenChange(false)}
      />
    </SectionedDialog>
  );
}
