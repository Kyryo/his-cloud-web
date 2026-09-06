"use client";

import { ShieldOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { ClinicalOrderProductList } from "@/features/clinical-opd/components/tabs/ClinicalOrderProductList";
import {
  useCancelOrder,
  useCreateOrder,
  useEncounterOrders,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type OrderDialogTab = "lab" | "radiology" | "procedures" | "sundries";

const ORDER_DIALOG_TABS: Array<{
  id: OrderDialogTab;
  label: string;
  itemType: ClinicalOrderItemType;
  capability: ClinicalCapabilityKey;
}> = [
  {
    id: "lab",
    label: "Lab",
    itemType: "LABORATORY",
    capability: "order_laboratory",
  },
  {
    id: "radiology",
    label: "Radiology",
    itemType: "RADIOLOGY",
    capability: "order_radiology",
  },
  {
    id: "procedures",
    label: "Procedures",
    itemType: "PROCEDURE",
    capability: "order_procedure",
  },
  {
    id: "sundries",
    label: "Sundries",
    itemType: "SUNDRY",
    capability: "order_sundry",
  },
];

type AddClinicalOrderDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  capabilities: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddClinicalOrderDialog({
  visitUuid,
  encounterUuid,
  capabilities,
  open,
  onOpenChange,
}: AddClinicalOrderDialogProps) {
  const { toast } = useToast();
  const { data: orders = [] } = useEncounterOrders(visitUuid, encounterUuid);
  const createOrder = useCreateOrder(visitUuid, encounterUuid);
  const cancelOrder = useCancelOrder(visitUuid, encounterUuid);
  const [busyProductUuid, setBusyProductUuid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderDialogTab>("lab");

  const capabilitySet = useMemo(() => new Set(capabilities), [capabilities]);

  const tabs = useMemo(
    () =>
      ORDER_DIALOG_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
      })),
    [],
  );

  const firstPermittedTab = useMemo(
    () => ORDER_DIALOG_TABS.find((tab) => capabilitySet.has(tab.capability)),
    [capabilitySet],
  );

  const activeTabConfig =
    ORDER_DIALOG_TABS.find((tab) => tab.id === activeTab) ?? ORDER_DIALOG_TABS[0];
  const canOrderActiveTab = capabilitySet.has(activeTabConfig.capability);

  const orderedProductOrderUuids = useMemo(() => {
    const map = new Map<string, string>();
    for (const order of orders) {
      if (order.status === "CANCELLED" || order.is_active === false) {
        continue;
      }
      if (!order.product_uuid || map.has(order.product_uuid)) {
        continue;
      }
      // Orders are newest-first; keep the most recent order per product.
      map.set(order.product_uuid, order.uuid);
    }
    return map;
  }, [orders]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveTab(firstPermittedTab?.id ?? "lab");
    setBusyProductUuid(null);
  }, [firstPermittedTab?.id, open]);

  const handleTabChange = (tabId: string) => {
    if (
      tabId !== "lab" &&
      tabId !== "radiology" &&
      tabId !== "procedures" &&
      tabId !== "sundries"
    ) {
      return;
    }
    setActiveTab(tabId);
  };

  const handleAddProduct = async (product: InventoryProduct) => {
    if (busyProductUuid || !canOrderActiveTab) {
      return;
    }
    if (orderedProductOrderUuids.has(product.uuid)) {
      return;
    }

    try {
      setBusyProductUuid(product.uuid);
      await createOrder.mutateAsync({
        item_type: activeTabConfig.itemType,
        description: product.display_name || product.name,
        product_uuid: product.uuid,
        clinical_quantity: 1,
        clinical_uom: product.uom_name?.trim() || "Unit",
        charge_quantity: 1,
      });
      toast({
        title: "Order placed",
        description: `${product.display_name || product.name} was added.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not place order",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to create the clinical order.",
        variant: "error",
      });
    } finally {
      setBusyProductUuid(null);
    }
  };

  const handleCancelOrder = async (
    product: InventoryProduct,
    orderUuid: string,
  ) => {
    if (busyProductUuid || !canOrderActiveTab) {
      return;
    }

    try {
      setBusyProductUuid(product.uuid);
      await cancelOrder.mutateAsync(orderUuid);
      toast({
        title: "Order cancelled",
        description: `${product.display_name || product.name} was cancelled.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not cancel order",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to cancel this order.",
        variant: "error",
      });
    } finally {
      setBusyProductUuid(null);
    }
  };

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add order"
      description="Select a catalog product to place the order. Lab, radiology, and procedure services always charge quantity 1."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      dismissible={false}
      className={appFont.className}
      data-testid="add-clinical-order-dialog"
      footer={
        <SecondaryButton
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={Boolean(busyProductUuid)}
          data-testid="clinical-order-close"
        >
          Close
        </SecondaryButton>
      }
    >
      {canOrderActiveTab ? (
        <ClinicalOrderProductList
          itemType={activeTabConfig.itemType}
          enabled
          busyProductUuid={busyProductUuid}
          orderedProductOrderUuids={orderedProductOrderUuids}
          onAddProduct={(product) => {
            void handleAddProduct(product);
          }}
          onCancelOrder={(product, orderUuid) => {
            void handleCancelOrder(product, orderUuid);
          }}
        />
      ) : (
        <EmptyState
          icon={ShieldOff}
          title={`No ${activeTabConfig.label.toLowerCase()} order privilege`}
          description={`Your role does not include permission to place ${activeTabConfig.label.toLowerCase()} orders. Ask an administrator to enable this capability for your clinical role.`}
          data-testid="clinical-order-capability-empty"
        />
      )}
    </TabbedDialog>
  );
}
