"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  ClaimLineOdontogramPicker,
  getPermanentFdiToothNumbers,
} from "@/features/dental/components/ClaimLineOdontogramPicker";
import type { SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type AssignSalesOrderLineTeethDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: SalesOrderLine | null;
  queuePosition?: { index: number; total: number } | null;
  isSaving?: boolean;
  error?: string | null;
  onSkip: () => void;
  onConfirm: (toothNumbers: number[]) => void | Promise<void>;
};

export function AssignSalesOrderLineTeethDialog({
  open,
  onOpenChange,
  line,
  queuePosition = null,
  isSaving = false,
  error = null,
  onSkip,
  onConfirm,
}: AssignSalesOrderLineTeethDialogProps) {
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [chartRemountToken, setChartRemountToken] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSelectedTeeth([]);
    setChartRemountToken((token) => token + 1);
  }, [open, line?.id]);

  const lineLabel = useMemo(() => {
    if (!line) return "procedure line";
    return (
      line.product_name?.trim() ||
      line.name?.trim() ||
      line.tariff_code?.trim() ||
      `Line #${line.id}`
    );
  }, [line]);

  const queueLabel =
    queuePosition && queuePosition.total > 1
      ? ` (${queuePosition.index} of ${queuePosition.total})`
      : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSaving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl",
          appFont.className,
        )}
        data-testid="assign-sales-order-line-teeth-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <DialogTitle>Assign teeth{queueLabel}</DialogTitle>
          <DialogDescription>
            Select the tooth or teeth for{" "}
            <span className="font-medium text-brand-navy">{lineLabel}</span>.
            You can skip and assign later. Payable procedures carry these teeth
            onto the insurance claim.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {error ? <StatusBanner variant="error" message={error} /> : null}

          <ClaimLineOdontogramPicker
            value={selectedTeeth}
            remountToken={chartRemountToken}
            disabled={isSaving}
            onRequestAssign={(toothNumbers) => {
              setSelectedTeeth((current) => {
                const next = new Set(current);
                for (const tooth of toothNumbers) next.add(tooth);
                return [...next].sort((a, b) => a - b);
              });
            }}
            onRemoveTeeth={(toothNumbers) => {
              const remove = new Set(toothNumbers);
              setSelectedTeeth((current) =>
                current.filter((tooth) => !remove.has(tooth)),
              );
            }}
            onSelectAll={() => setSelectedTeeth(getPermanentFdiToothNumbers())}
            onDeselectAll={() => setSelectedTeeth([])}
          />
        </div>

        <DialogFooter className="border-t border-brand-border px-6 py-4">
          <SecondaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving}
            onClick={onSkip}
            data-testid="assign-so-teeth-skip"
          >
            Skip for now
          </SecondaryButton>
          <PrimaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving || selectedTeeth.length === 0}
            onClick={() => {
              void onConfirm(selectedTeeth);
            }}
            data-testid="assign-so-teeth-confirm"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save teeth"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
