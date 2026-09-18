"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import type {
  LabOrder,
  LabSpecimen,
} from "@/features/laboratory/types/laboratory.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AccessionOrderDialogProps = {
  order: LabOrder;
  specimens: LabSpecimen[];
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (specimenUuids?: string[]) => void;
};

export function AccessionOrderDialog({
  order,
  specimens,
  open,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: AccessionOrderDialogProps) {
  const collectable = useMemo(
    () => specimens.filter((specimen) => specimen.status === "COLLECTED"),
    [specimens],
  );
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setSelectedUuids(
        specimens
          .filter((specimen) => specimen.status === "COLLECTED")
          .map((specimen) => specimen.uuid),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [open, specimens]);

  function toggle(uuid: string) {
    setSelectedUuids((current) =>
      current.includes(uuid)
        ? current.filter((item) => item !== uuid)
        : [...current, uuid],
    );
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Accession order"
      description={`Assign an accession number for order ${order.uuid.slice(0, 8)}.`}
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="accession-order-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              onConfirm(
                selectedUuids.length === 0 ||
                  selectedUuids.length === collectable.length
                  ? undefined
                  : selectedUuids,
              )
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Accessioning…
              </>
            ) : (
              "Accession"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {collectable.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No collected specimens are ready to accession. Collect a specimen
            first.
          </p>
        ) : (
          <div className="space-y-2">
            <Label>Specimens to accession</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-dash-border p-3">
              {collectable.map((specimen) => (
                <label
                  key={specimen.uuid}
                  className="flex cursor-pointer items-start gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={selectedUuids.includes(specimen.uuid)}
                    onChange={() => toggle(specimen.uuid)}
                  />
                  <span>
                    <span className="font-medium text-brand-navy">
                      {specimen.specimen_type_name}
                    </span>
                    <span className="ml-1 text-xs text-brand-muted">
                      {specimen.barcode || specimen.uuid.slice(0, 8)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionedDialog>
  );
}
