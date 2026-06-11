"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmptyAdjustmentLineItem,
  InventoryAdjustmentLineItemsEditor,
  type InventoryAdjustmentLineItemDraft,
} from "@/features/inventory/components/forms/InventoryAdjustmentLineItemsEditor";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import {
  createStockAdjustment,
  type StockAdjustmentPayload,
} from "@/features/inventory/services/stock-adjustments.service";
import type {
  StockAdjustment,
  StockAdjustmentLine,
} from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateStockAdjustmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (adjustment: StockAdjustment) => void;
};

type CreateStockAdjustmentTab = "details" | "lines";

export function CreateStockAdjustmentDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateStockAdjustmentDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreateStockAdjustmentTab>("details");
  const [location, setLocation] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<string>("QUANTITY");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<InventoryAdjustmentLineItemDraft[]>([
    createEmptyAdjustmentLineItem(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setActiveTab("details");
    setLocation("");
    setAdjustmentType("QUANTITY");
    setReason("");
    setLines([createEmptyAdjustmentLineItem()]);
  }

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  async function handleCreate() {
    if (!location) {
      toast({
        title: "Location required",
        description: "Choose the location for this adjustment.",
        variant: "error",
      });
      setActiveTab("details");
      return;
    }

    const validLines: StockAdjustmentLine[] = lines
      .filter((line) => line.odoo_product_id)
      .map((line) => ({
        odoo_product_id: line.odoo_product_id!,
        quantity_delta: line.quantity_delta,
      }));

    if (validLines.length === 0) {
      toast({
        title: "Line items required",
        description: "Add at least one product to this stock adjustment.",
        variant: "error",
      });
      setActiveTab("lines");
      return;
    }

    const payload: StockAdjustmentPayload = {
      location: Number(location),
      adjustment_type: adjustmentType,
      reason: reason.trim() || null,
      lines: validLines,
    };

    setIsSubmitting(true);
    try {
      const adjustment = await createStockAdjustment(payload);
      toast({
        title: "Stock adjustment created",
        description: `${adjustment.reference_number} is ready for review.`,
        variant: "success",
      });
      resetForm();
      onOpenChange(false);
      onCreated(adjustment);
    } catch (err) {
      toast({
        title: "Could not create stock adjustment",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const tabs = [
    { id: "details", label: "Details" },
    { id: "lines", label: "Line items" },
  ];

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New stock adjustment"
      description="Record quantity or cost adjustments at a location."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "lines") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="create-stock-adjustment-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          {activeTab === "details" ? (
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => setActiveTab("lines")}
            >
              Continue to line items
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleCreate()}
              data-testid="create-stock-adjustment-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create adjustment"
              )}
            </PrimaryButton>
          )}
        </>
      }
    >
      {activeTab === "details" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InventoryLocationSelect
              id="sa-location"
              label="Location"
              value={location}
              onValueChange={(locationId) => setLocation(String(locationId))}
            />
            <div className="space-y-2">
              <Label htmlFor="sa-type">Adjustment type</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger id="sa-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUANTITY">Quantity</SelectItem>
                  <SelectItem value="COST">Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sa-reason">Reason</Label>
            <textarea
              id="sa-reason"
              value={reason}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(event.target.value)
              }
              placeholder="Optional reason for this adjustment"
              rows={2}
              className="flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      ) : (
        <InventoryAdjustmentLineItemsEditor lines={lines} onChange={setLines} />
      )}
    </TabbedDialog>
  );
}
