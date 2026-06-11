"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import { updateInventoryBatch } from "@/features/inventory/services/batches.service";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatDisplayDate, formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";
import { useToast } from "@/providers/toast-provider";

type BatchDetailTabsProps = {
  batch: InventoryBatch;
  onUpdated: (batch: InventoryBatch) => void;
};

type DetailTabId = "summary" | "edit";

export function BatchDetailTabs({ batch, onUpdated }: BatchDetailTabsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DetailTabId>("summary");
  const [batchNumber, setBatchNumber] = useState(batch.batch_number);
  const [expiryDate, setExpiryDate] = useState(batch.expiry_date ?? "");
  const [manufactureDate, setManufactureDate] = useState(batch.manufacture_date ?? "");
  const [supplier, setSupplier] = useState(batch.supplier ?? "");
  const [notes, setNotes] = useState(batch.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBatchNumber(batch.batch_number);
    setExpiryDate(batch.expiry_date ?? "");
    setManufactureDate(batch.manufacture_date ?? "");
    setSupplier(batch.supplier ?? "");
    setNotes(batch.notes ?? "");
  }, [batch]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!batchNumber.trim()) {
      toast({
        title: "Batch number required",
        description: "Enter a batch number before saving.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateInventoryBatch(batch.uuid, {
        batch_number: batchNumber.trim(),
        expiry_date: expiryDate || null,
        manufacture_date: manufactureDate || null,
        supplier: supplier.trim() || null,
        notes: notes.trim() || null,
      });
      onUpdated(updated);
      toast({
        title: "Batch updated",
        description: `${updated.batch_number} has been saved.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Could not update batch",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Batch sections">
        <DetailPageTabNavItem
          isActive={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </DetailPageTabNavItem>
        <DetailPageTabNavItem
          isActive={activeTab === "edit"}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainSection>
        {activeTab === "summary" ? (
          <InventorySummaryPanel
            sections={[
              {
                title: "Batch details",
                fields: [
                  { label: "Batch number", value: batch.batch_number },
                  { label: "Product ID", value: batch.odoo_product_id },
                  { label: "Expiry date", value: formatDisplayDate(batch.expiry_date) },
                  {
                    label: "Manufacture date",
                    value: formatDisplayDate(batch.manufacture_date),
                  },
                  { label: "Supplier", value: batch.supplier ?? "—" },
                  {
                    label: "Notes",
                    value: batch.notes?.trim() ? batch.notes : "—",
                  },
                  { label: "Status", value: batch.is_active ? "Active" : "Inactive" },
                  { label: "Created", value: formatDisplayDateTime(batch.created_at) },
                  { label: "Updated", value: formatDisplayDateTime(batch.updated_at) },
                ],
              },
            ]}
          />
        ) : (
          <form
            onSubmit={(event) => void handleSave(event)}
            className="max-w-xl space-y-4 rounded-xl border border-brand-border bg-white p-6"
          >
            <div className="space-y-2">
              <Label htmlFor="batch-number">Batch number</Label>
              <Input
                id="batch-number"
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="batch-expiry">Expiry date</Label>
                <Input
                  id="batch-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-manufacture">Manufacture date</Label>
                <Input
                  id="batch-manufacture"
                  type="date"
                  value={manufactureDate}
                  onChange={(event) => setManufactureDate(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-supplier">Supplier</Label>
              <Input
                id="batch-supplier"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-notes">Notes</Label>
              <textarea
                id="batch-notes"
                value={notes}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(event.target.value)
                }
                rows={3}
                className="flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryButton type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => setActiveTab("summary")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
