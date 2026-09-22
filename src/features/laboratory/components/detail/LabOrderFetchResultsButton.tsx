"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type LabOrderFetchResultsButtonProps = {
  className?: string;
  /** Optional stable id for multi-card pages. */
  testId?: string;
};

export function LabOrderFetchResultsButton({
  className,
  testId = "lab-action-fetch-results",
}: LabOrderFetchResultsButtonProps) {
  const { order } = useLabOrderDetailWorkspace();
  const [open, setOpen] = useState(false);
  const disabled = order.status === "CANCELLED";

  return (
    <>
      <SecondaryButton
        type="button"
        size="sm"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={cn("h-7 gap-1 rounded-md px-2.5 text-xs", className)}
        data-testid={testId}
      >
        <Download className="size-3.5" aria-hidden="true" />
        Fetch results
      </SecondaryButton>

      <SectionedDialog
        open={open}
        onOpenChange={setOpen}
        title="Analyzer not connected"
        description="Results cannot be pulled from instruments right now."
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="lab-fetch-results-dialog"
        footer={
          <PrimaryButton type="button" onClick={() => setOpen(false)}>
            Got it
          </PrimaryButton>
        }
      >
        <p className="text-sm text-brand-slate">
          No chemistry analyzer or laboratory instrument is connected for this
          workspace. Connect an analyzer in laboratory settings, or enter
          results manually on the Results tab.
        </p>
      </SectionedDialog>
    </>
  );
}
