"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  createEmptyLineItem,
  InventoryLineItemsEditor,
  type InventoryLineItemDraft,
} from "@/features/inventory/components/forms/InventoryLineItemsEditor";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import {
  createInternalOrder,
  type InternalOrderPayload,
} from "@/features/inventory/services/internal-orders.service";
import type {
  InternalOrder,
  InternalOrderLine,
} from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type CreateInternalOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: InternalOrder) => void;
};

type CreateInternalOrderTab = "details" | "lines";

export function CreateInternalOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateInternalOrderDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<CreateInternalOrderTab>("details");
  const [sourceLocation, setSourceLocation] = useState<string>("");
  const [destinationLocation, setDestinationLocation] = useState<string>("");
  const [lines, setLines] = useState<InventoryLineItemDraft[]>([createEmptyLineItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setActiveTab("details");
    setSourceLocation("");
    setDestinationLocation("");
    setLines([createEmptyLineItem()]);
  }

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  async function handleCreate() {
    if (!sourceLocation || !destinationLocation) {
      toast({
        title: "Locations required",
        description: "Choose both source and destination locations.",
        variant: "error",
      });
      setActiveTab("details");
      return;
    }

    if (sourceLocation === destinationLocation) {
      toast({
        title: "Locations must differ",
        description: "Source and destination cannot be the same location.",
        variant: "error",
      });
      setActiveTab("details");
      return;
    }

    const validLines: InternalOrderLine[] = lines
      .filter((line) => line.odoo_product_id)
      .map((line) => ({
        odoo_product_id: line.odoo_product_id!,
        quantity: line.quantity,
      }));

    if (validLines.length === 0) {
      toast({
        title: "Line items required",
        description: "Add at least one product to this internal order.",
        variant: "error",
      });
      setActiveTab("lines");
      return;
    }

    const payload: InternalOrderPayload = {
      source_location: Number(sourceLocation),
      destination_location: Number(destinationLocation),
      lines: validLines,
    };

    setIsSubmitting(true);
    try {
      const order = await createInternalOrder(payload);
      toast({
        title: "Internal order created",
        description: `${order.reference_number} is ready for review.`,
        variant: "success",
      });
      resetForm();
      onOpenChange(false);
      onCreated(order);
    } catch (err) {
      toast({
        title: "Could not create internal order",
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
      title="New internal order"
      description="Transfer stock between locations with a draft internal order."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "details" || tabId === "lines") {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="create-internal-order-dialog"
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
              data-testid="create-internal-order-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create order"
              )}
            </PrimaryButton>
          )}
        </>
      }
    >
      {activeTab === "details" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <InventoryLocationSelect
            id="io-source-location"
            label="Source location"
            value={sourceLocation}
            onValueChange={(locationId) => setSourceLocation(String(locationId))}
          />
          <InventoryLocationSelect
            id="io-destination-location"
            label="Destination location"
            value={destinationLocation}
            onValueChange={(locationId) =>
              setDestinationLocation(String(locationId))
            }
          />
        </div>
      ) : (
        <InventoryLineItemsEditor
          lines={lines}
          onChange={setLines}
          showUnitCost={false}
        />
      )}
    </TabbedDialog>
  );
}
