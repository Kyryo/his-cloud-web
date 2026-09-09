import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";

type AppointmentDetailSheetFooterProps = {
  mode: "overview" | "edit";
  editable: boolean;
  showStart: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onStartVisit?: () => void;
};

export function AppointmentDetailSheetFooter({
  mode,
  editable,
  showStart,
  isSubmitting,
  onClose,
  onEdit,
  onCancelEdit,
  onSave,
  onStartVisit,
}: AppointmentDetailSheetFooterProps) {
  if (mode === "edit") {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-border/60 px-6 py-4">
        <SecondaryButton type="button" disabled={isSubmitting} onClick={onCancelEdit}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="button" disabled={isSubmitting} onClick={onSave}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-border/60 px-6 py-4">
      {editable ? (
        <SecondaryButton type="button" onClick={onEdit}>
          Edit
        </SecondaryButton>
      ) : null}
      {showStart && onStartVisit ? (
        <PrimaryButton type="button" onClick={onStartVisit}>
          Start visit
        </PrimaryButton>
      ) : (
        <SecondaryButton type="button" onClick={onClose}>
          Close
        </SecondaryButton>
      )}
    </div>
  );
}
