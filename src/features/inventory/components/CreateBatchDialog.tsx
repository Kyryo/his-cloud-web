"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
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
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { InlineProductCombobox } from "@/features/inventory/components/detail/InlineProductCombobox";
import { SupplierCombobox } from "@/features/inventory/components/SupplierCombobox";
import { checkSession } from "@/features/auth/services/auth.service";
import { createInventoryBatch } from "@/features/inventory/services/batches.service";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CreateBatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (batch: InventoryBatch) => void;
};

export function CreateBatchDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateBatchDialogProps) {
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [selectedProductUuid, setSelectedProductUuid] = useState<string | null>(null);
  const [selectedProductLabel, setSelectedProductLabel] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedProductUuid(null);
    setSelectedProductLabel(null);
    setSelectedProductType(null);
    setBatchNumber("");
    setExpiryDate("");
    setManufactureDate("");
    setSupplier("");
    setNotes("");

    void (async () => {
      try {
        const session = await checkSession();
        const tenant =
          session.user?.tenant?.id ?? session.user?.primary_clinic?.tenant ?? null;
        setTenantId(tenant);
      } catch {
        setTenantId(null);
      }
    })();
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!tenantId) {
      toast({ description: "Tenant context is required.", variant: "error" });
      return;
    }

    if (!selectedProductUuid) {
      toast({ description: "Product is required.", variant: "error" });
      return;
    }

    if (selectedProductType === "service") {
      toast({
        description:
          "Service products cannot have batches. Choose a stockable or consumable product.",
        variant: "error",
      });
      return;
    }

    if (!batchNumber.trim()) {
      toast({ description: "Batch number is required.", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createInventoryBatch({
        tenant: tenantId,
        product_uuid: selectedProductUuid,
        batch_number: batchNumber.trim(),
        expiry_date: expiryDate || null,
        manufacture_date: manufactureDate || null,
        supplier: supplier.trim() || null,
        notes: notes.trim() || null,
      });

      toast({
        variant: "success",
        title: "Batch created",
        description: `${created.batch_number} has been added.`,
      });
      onCreated(created);
      onOpenChange(false);
    } catch (err) {
      toast({
        description: err instanceof Error ? err.message : "Could not create batch.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>New batch</DialogTitle>
          <DialogDescription>
            Create a batch record for lot and expiry tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="create-batch-product">
              Product <RequiredFieldMarker />
            </Label>
            <InlineProductCombobox
              id="create-batch-product"
              value={selectedProductUuid}
              displayLabel={selectedProductLabel}
              disabled={isSubmitting}
              onSelect={(product) => {
                setSelectedProductUuid(product.uuid);
                setSelectedProductLabel(formatProductLabel(product));
                setSelectedProductType(product.product_type ?? null);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-batch-number">
              Batch number <RequiredFieldMarker />
            </Label>
            <Input
              id="create-batch-number"
              value={batchNumber}
              disabled={isSubmitting}
              onChange={(event) => setBatchNumber(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-batch-expiry">Expiry date</Label>
              <Input
                id="create-batch-expiry"
                type="date"
                value={expiryDate}
                disabled={isSubmitting}
                onChange={(event) => setExpiryDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-batch-manufacture">Manufacture date</Label>
              <Input
                id="create-batch-manufacture"
                type="date"
                value={manufactureDate}
                disabled={isSubmitting}
                onChange={(event) => setManufactureDate(event.target.value)}
              />
            </div>
          </div>
          <SupplierCombobox
            value={supplier}
            disabled={isSubmitting}
            onChange={setSupplier}
          />
          <div className="space-y-2">
            <Label htmlFor="create-batch-notes">Notes</Label>
            <textarea
              id="create-batch-notes"
              value={notes}
              disabled={isSubmitting}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(event.target.value)
              }
              rows={3}
              className="flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create batch"
              )}
            </PrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
