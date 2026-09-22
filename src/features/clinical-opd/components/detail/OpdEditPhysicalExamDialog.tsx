"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  OpdPhysicalExamComposer,
  PHYSICAL_EXAM_EDIT_FORM_ID,
} from "@/features/clinical-opd/components/detail/OpdPhysicalExamComposer";
import type { EncounterPhysicalExam } from "@/features/clinical-opd/types/clinical-opd.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdEditPhysicalExamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitUuid: string;
  encounterUuid: string;
  exam: EncounterPhysicalExam;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
};

export function OpdEditPhysicalExamDialog({
  open,
  onOpenChange,
  visitUuid,
  encounterUuid,
  exam,
  onDelete,
  isDeleting = false,
}: OpdEditPhysicalExamDialogProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
      <SectionedDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmDeleteOpen(false);
          }
          onOpenChange(nextOpen);
        }}
        title="Edit examination"
        description="Update the physical examination findings."
        className={cn(appFont.className, "sm:max-w-xl")}
        data-testid="opd-edit-physical-exam-dialog"
        footer={
          <>
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive hover:bg-transparent hover:text-destructive"
                disabled={isDeleting}
                onClick={() => setConfirmDeleteOpen(true)}
                data-testid="opd-edit-physical-exam-delete"
              >
                Delete
              </Button>
            ) : null}
            <SecondaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              form={PHYSICAL_EXAM_EDIT_FORM_ID}
              disabled={isDeleting}
            >
              Save
            </PrimaryButton>
          </>
        }
      >
        <OpdPhysicalExamComposer
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          exam={exam}
          formId={PHYSICAL_EXAM_EDIT_FORM_ID}
          showFooterActions={false}
          onSaved={() => onOpenChange(false)}
        />
      </SectionedDialog>

      <SectionedDialog
        open={confirmDeleteOpen}
        onOpenChange={(nextOpen) => {
          if (!isDeleting) {
            setConfirmDeleteOpen(nextOpen);
          }
        }}
        title="Delete examination?"
        description="This removes the examination findings from this encounter."
        className={cn(appFont.className, "sm:max-w-md")}
        data-testid="opd-confirm-delete-physical-exam-dialog"
        footer={
          <>
            <SecondaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => setConfirmDeleteOpen(false)}
              data-testid="opd-confirm-delete-physical-exam-cancel"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
              onClick={() => {
                void (async () => {
                  await onDelete?.();
                  setConfirmDeleteOpen(false);
                })();
              }}
              data-testid="opd-confirm-delete-physical-exam-confirm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm text-brand-slate">
          You can record a new examination afterwards. This action is logged on
          the visit activity.
        </p>
      </SectionedDialog>
    </>
  );
}
