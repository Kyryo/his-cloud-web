"use client";

import { PrimaryButton } from "@/components/ui/app-buttons";

type LabPanelDetailActionsProps = {
  onEdit: () => void;
};

export function LabPanelDetailActions({ onEdit }: LabPanelDetailActionsProps) {
  return (
    <PrimaryButton
      type="button"
      size="sm"
      onClick={onEdit}
      data-testid="lab-panel-detail-edit"
    >
      Edit
    </PrimaryButton>
  );
}
