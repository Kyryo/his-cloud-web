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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import { updateInternalOrder } from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateInternalOrderDialogProps = {
  order: InternalOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: InternalOrder) => void;
};

export function UpdateInternalOrderDialog({
  order,
  open,
  onOpenChange,
  onUpdated,
}: UpdateInternalOrderDialogProps) {
  const { toast } = useToast();
  const [sourceLocation, setSourceLocation] = useState(String(order.source_location));
  const [destinationLocation, setDestinationLocation] = useState(
    String(order.destination_location),
  );
  const [notes, setNotes] = useState(order.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSourceLocation(String(order.source_location));
      setDestinationLocation(String(order.destination_location));
      setNotes(order.notes ?? "");
    }
  }, [open, order]);

  async function handleSave() {
    if (!sourceLocation || !destinationLocation) {
      toast({
        title: "Locations required",
        description: "Choose both source and destination locations.",
        variant: "error",
      });
      return;
    }

    if (sourceLocation === destinationLocation) {
      toast({
        title: "Locations must differ",
        description: "Source and destination cannot be the same location.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateInternalOrder(order.uuid, {
        source_location: Number(sourceLocation),
        destination_location: Number(destinationLocation),
        notes: notes.trim() || null,
      });
      toast({
        variant: "success",
        title: "Internal order updated",
        description: `${updated.reference_number} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update internal order",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Update internal order</DialogTitle>
          <DialogDescription>
            Edit transfer locations and notes for {order.reference_number}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <InventoryLocationSelect
            id="internal-order-source-location"
            label="Source location"
            value={sourceLocation}
            onValueChange={setSourceLocation}
          />
          <InventoryLocationSelect
            id="internal-order-destination-location"
            label="Destination location"
            value={destinationLocation}
            onValueChange={setDestinationLocation}
          />
          <div>
            <Label htmlFor="internal-order-notes">Notes</Label>
            <Textarea
              id="internal-order-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" disabled={isSaving} onClick={() => void handleSave()}>
            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Save changes
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
