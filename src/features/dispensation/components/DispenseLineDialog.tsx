"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDispensation } from "@/features/dispensation/services/dispensation.service";
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
import { useSessionStore } from "@/state/session.store";

type DispenseLineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  line: DispensationQueueLine | null;
  clinicId: number | null;
  onDispensed: () => void;
};

export function DispenseLineDialog({
  open,
  onOpenChange,
  line,
  clinicId,
  onDispensed,
}: DispenseLineDialogProps) {
  const { toast } = useToast();
  const userLocations = useSessionStore((state) => state.user?.locations);
  const isTenantAdmin = Boolean(useSessionStore((state) => state.user?.is_admin));
  const [locations, setLocations] = useState<InventoryLocationOption[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedLocationIds = useMemo(() => {
    const ids = new Set<number>();
    for (const association of userLocations ?? []) {
      if (association.is_active) {
        ids.add(association.location);
      }
    }
    return ids;
  }, [userLocations]);

  const remaining = useMemo(
    () =>
      line
        ? remainingQuantity(line.quantity, line.dispensed_quantity)
        : 0,
    [line],
  );

  useEffect(() => {
    if (!open || !line) {
      return;
    }
    setQuantity(String(remaining > 0 ? remaining : ""));
    setLocationId("");
  }, [open, line, remaining]);

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
          setLocations(
            isTenantAdmin
              ? response.results
              : response.results.filter((location) =>
                  assignedLocationIds.has(location.id),
                ),
          );
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
  }, [assignedLocationIds, clinicId, isTenantAdmin, open, toast]);

  const handleSubmit = useCallback(async () => {
    if (!line) {
      return;
    }
    const qty = Number(quantity);
    if (!locationId || !(qty > 0) || qty > remaining) {
      toast({
        title: "Invalid dispensation",
        description: "Choose a location and a quantity within the remaining amount.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDispensation({
        sales_order_line: line.id,
        location: Number(locationId),
        quantity: qty,
      });
      toast({
        title: "Dispensed",
        description: `${formatDispensationQuantity(qty)} of ${line.product_name} dispensed.`,
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
  }, [
    line,
    locationId,
    onDispensed,
    onOpenChange,
    quantity,
    remaining,
    toast,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Dispense product</DialogTitle>
          <DialogDescription>
            {line
              ? `${line.product_name} — ${formatDispensationQuantity(remaining)} remaining`
              : "Select a line to dispense."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="dispense-location">Location</Label>
            <Select
              value={locationId}
              onValueChange={setLocationId}
              disabled={isLoadingLocations || isSubmitting}
            >
              <SelectTrigger id="dispense-location">
                <SelectValue
                  placeholder={
                    isLoadingLocations ? "Loading locations…" : "Select location"
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

          <div className="space-y-2">
            <Label htmlFor="dispense-qty">Quantity</Label>
            <Input
              id="dispense-qty"
              type="number"
              step="any"
              min="0"
              max={remaining}
              value={quantity}
              disabled={isSubmitting}
              onChange={(event) => setQuantity(event.target.value)}
            />
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
            disabled={isSubmitting || !line}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "Dispensing…" : "Dispense"}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
