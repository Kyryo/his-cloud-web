"use client";

import { PrimaryButton } from "@/components/ui/app-buttons";

type LabTestDetailActionsProps = {
  onEdit: () => void;
};

export function LabTestDetailActions({ onEdit }: LabTestDetailActionsProps) {
  return (
    <PrimaryButton
      type="button"
      size="sm"
      onClick={onEdit}
      data-testid="lab-test-detail-edit"
    >
      Edit
    </PrimaryButton>
  );
}
