"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type IncludeAttachmentPrintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentLabel: "Sales Order" | "Invoice";
  isWorking: boolean;
  onInclude: () => void;
  onWithout: () => void;
};

export function IncludeAttachmentPrintDialog({
  open,
  onOpenChange,
  documentLabel,
  isWorking,
  onInclude,
  onWithout,
}: IncludeAttachmentPrintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="include-attachment-print-dialog"
      >
        <DialogHeader>
          <DialogTitle>Include attachment?</DialogTitle>
          <DialogDescription>
            This encounter has an attached document. Include it with the{" "}
            {documentLabel}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            disabled={isWorking}
            onClick={onInclude}
            data-testid="include-attachment-confirm"
          >
            {isWorking ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Preparing…
              </>
            ) : (
              "Include attachment"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isWorking}
            onClick={onWithout}
            data-testid="include-attachment-skip"
          >
            Print without attachment
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isWorking}
            onClick={() => onOpenChange(false)}
            data-testid="include-attachment-cancel"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
