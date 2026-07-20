"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDispensationsBatch } from "@/features/dispensation/services/dispensation.service";
import type { DispensationQueueLine } from "@/features/dispensation/types/dispensation.types";
import {
  formatDispensationQuantity,
  remainingQuantity,
} from "@/features/dispensation/utils/dispensation-qty";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import type { InventoryLocationOption } from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type DispenseSelectedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: number | null;
  lines: DispensationQueueLine[];
  onDispensed: () => void;
};

export function DispenseSelectedDialog({
  open,
  onOpenChange,
  clinicId,
  lines,
  onDispensed,
}: DispenseSelectedDialogProps) {
  const { toast } = useToast();
  const [locations, setLocations] = useState<InventoryLocationOption[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useMemo(
    () =>
      lines
        .map((line) => ({
          line,
          remaining: remainingQuantity(line.quantity, line.dispensed_quantity),
        }))
        .filter((item) => item.remaining > 0),
    [lines],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setLocationId("");
  }, [open]);

  useEffect(() => {
    if (!open || clinicId == null) {
      return;
    }

    let cancelled = false;

    async function loadLocations() {
      setIsLoadingLocations(true);
      try {
        const response = await fetchInventoryLocations(clinicId ?? undefined);
        if (!cancelled) {
          setLocations(response.results);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: "Could not load locations",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, [clinicId, open, toast]);

  const handleSubmit = useCallback(async () => {
    if (!locationId || items.length === 0) {
      toast({
        title: "Invalid dispensation",
        description: "Choose a location and at least one line item to dispense.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDispensationsBatch({
        location: Number(locationId),
        items: items.map(({ line, remaining }) => ({
          sales_order_line: line.id,
          quantity: remaining.toFixed(4),
        })),
      });
      toast({
        title: "Dispensed",
        description:
          items.length === 1
            ? `Dispensed ${items[0]?.line.product_name}.`
            : `Dispensed ${items.length} selected line items.`,
        variant: "success",
      });
      onOpenChange(false);
      onDispensed();
    } catch (error) {
      toast({
        title: "Dispense failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [items, locationId, onDispensed, onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Dispense selected items</DialogTitle>
          <DialogDescription>
            Dispense all selected line items from one location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label
              htmlFor="dispense-selected-location"
              className="text-sm font-medium text-brand-navy"
            >
              Location
            </label>
            <Select
              value={locationId}
              onValueChange={setLocationId}
              disabled={isLoadingLocations || isSubmitting}
            >
              <SelectTrigger id="dispense-selected-location">
                <SelectValue
                  placeholder={
                    isLoadingLocations ? "Loading locations..." : "Select location"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-brand-border bg-slate-50/70">
            <div className="border-b border-brand-border px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">Selected items</p>
              <p className="text-xs text-brand-muted">
                {items.length} line{items.length === 1 ? "" : "s"} will be dispensed in
                full.
              </p>
            </div>
            <div className="divide-y divide-brand-border">
              {items.map(({ line, remaining }) => (
                <div
                  key={line.uuid}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {line.product_name}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-brand-muted">
                    {formatDispensationQuantity(remaining)} remaining
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || items.length === 0}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Dispensing...
              </>
            ) : (
              "Dispense"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
