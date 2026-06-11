"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEmptyLineItem,
  InventoryLineItemsEditor,
  type InventoryLineItemDraft,
} from "@/features/inventory/components/forms/InventoryLineItemsEditor";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import {
  createPurchaseOrder,
  type PurchaseOrderPayload,
} from "@/features/inventory/services/purchase-orders.service";
import type {
  PurchaseOrder,
  PurchaseOrderLine,
} from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreatePurchaseOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: PurchaseOrder) => void;
};

type CreatePurchaseOrderTab = "details" | "lines";

export function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePurchaseOrderDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreatePurchaseOrderTab>("details");
  const [vendorName, setVendorName] = useState("");
  const [receivingLocation, setReceivingLocation] = useState<string>("");
  const [lines, setLines] = useState<InventoryLineItemDraft[]>([createEmptyLineItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setActiveTab("details");
    setVendorName("");
    setReceivingLocation("");
    setLines([createEmptyLineItem()]);
  }

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  async function handleCreate() {
    if (!vendorName.trim()) {
      toast({
        title: "Vendor required",
        description: "Enter the supplier name before creating the order.",
        variant: "error",
      });
      setActiveTab("details");
      return;
    }

    if (!receivingLocation) {
      toast({
        title: "Location required",
        description: "Choose where stock will be received.",
        variant: "error",
      });
      setActiveTab("details");
      return;
    }

    const validLines: PurchaseOrderLine[] = lines
      .filter((line) => line.odoo_product_id)
      .map((line) => ({
        odoo_product_id: line.odoo_product_id!,
        quantity: line.quantity,
        unit_cost: line.unit_cost,
      }));

    if (validLines.length === 0) {
      toast({
        title: "Line items required",
        description: "Add at least one product to this purchase order.",
        variant: "error",
      });
      setActiveTab("lines");
      return;
    }

    const payload: PurchaseOrderPayload = {
      vendor_name: vendorName.trim(),
      receiving_location: Number(receivingLocation),
      lines: validLines,
    };

    setIsSubmitting(true);
    try {
      const order = await createPurchaseOrder(payload);
      toast({
        title: "Purchase order created",
        description: `${order.reference_number} is ready for review.`,
        variant: "success",
      });
      resetForm();
      onOpenChange(false);
      onCreated(order);
    } catch (err) {
      toast({
        title: "Could not create purchase order",
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
      title="New purchase order"
      description="Record inbound stock from a vendor. Sigma will keep this in draft until you submit it."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "lines") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="create-purchase-order-dialog"
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
              data-testid="create-purchase-order-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create purchase order"
              )}
            </PrimaryButton>
          )}
        </>
      }
    >
      {activeTab === "details" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="po-vendor">Vendor name</Label>
            <Input
              id="po-vendor"
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              placeholder="Supplier name"
            />
          </div>
          <div className="sm:col-span-2">
            <InventoryLocationSelect
              id="po-receiving-location"
              label="Receiving location"
              value={receivingLocation}
              onValueChange={(locationId) =>
                setReceivingLocation(String(locationId))
              }
            />
          </div>
        </div>
      ) : (
        <InventoryLineItemsEditor lines={lines} onChange={setLines} />
      )}
    </TabbedDialog>
  );
}
