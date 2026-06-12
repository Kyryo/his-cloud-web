"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchInventoryBatches } from "@/features/inventory/services/batches.service";
import type { InternalOrderLineDraft } from "@/features/inventory/types/internal-order-line-draft";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatDisplayDate } from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type InternalOrderLineBatchSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: InternalOrderLineDraft | null;
  onSaved: (patch: Pick<InternalOrderLineDraft, "batch" | "batchNumber">) => Promise<void>;
};

export function InternalOrderLineBatchSelectDialog({
  open,
  onOpenChange,
  line,
  onSaved,
}: InternalOrderLineBatchSelectDialogProps) {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !line?.odoo_product_id) {
      return;
    }

    let cancelled = false;

    async function loadBatches() {
      setIsLoading(true);
      setError(null);
      setSelectedBatchId(line?.batch ?? null);

      try {
        const response = await fetchInventoryBatches({
          odoo_product_id: line!.odoo_product_id!,
          pageSize: 100,
        });
        if (!cancelled) {
          setBatches(response.results);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load batches for this product.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBatches();

    return () => {
      cancelled = true;
    };
  }, [line, open]);

  async function handleSave() {
    if (!selectedBatchId) {
      setError("Select a batch to continue.");
      return;
    }

    const selected = batches.find((batch) => batch.id === selectedBatchId);
    if (!selected) {
      setError("Selected batch is no longer available.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSaved({
        batch: selected.id,
        batchNumber: selected.batch_number,
      });
      onOpenChange(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save batch selection.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Select batch</DialogTitle>
          <DialogDescription>
            Choose an existing batch for {line?.productName ?? "this product"}.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-brand-muted">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <p className="py-6 text-sm text-brand-muted">
            No batches are available for this product.
          </p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {batches.map((batch) => {
              const isSelected = selectedBatchId === batch.id;

              return (
                <button
                  key={batch.id}
                  type="button"
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "border-brand-primary bg-brand-tint/40"
                      : "border-brand-border hover:bg-slate-50",
                  )}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <p className="text-sm font-medium text-brand-navy">{batch.batch_number}</p>
                  <p className="mt-1 text-xs text-brand-muted">
                    Expires {formatDisplayDate(batch.expiry_date)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving || isLoading || batches.length === 0}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save batch
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
