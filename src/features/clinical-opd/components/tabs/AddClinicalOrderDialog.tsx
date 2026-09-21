"use client";

import { ShieldOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { ClinicalOrderProductList } from "@/features/clinical-opd/components/tabs/ClinicalOrderProductList";
import {
  useCancelOrder,
  useCreateOrder,
  useEncounterOrders,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";
import { formatAllergyAlertMessage } from "@/features/clinical-opd/utils/opd-allergy-alerts";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
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
  embedded?: boolean;
};

export function AddClinicalOrderDialog({
  visitUuid,
  encounterUuid,
  capabilities,
  open,
  onOpenChange,
  embedded = false,
}: AddClinicalOrderDialogProps) {
  const { toast } = useToast();
  const { data: orders = [] } = useEncounterOrders(visitUuid, encounterUuid, {
    enabled: open,
  });
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

    let cancelled = false;
    async function resetDialog() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setActiveTab(firstPermittedTab?.id ?? "lab");
      setBusyProductUuid(null);
    }

    void resetDialog();
    return () => {
      cancelled = true;
    };
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
      const created = await createOrder.mutateAsync({
        item_type: activeTabConfig.itemType,
        description: product.display_name || product.name,
        product_uuid: product.uuid,
        clinical_quantity: 1,
        clinical_uom: product.uom_name?.trim() || "Unit",
        charge_quantity: 1,
      });
      const allergyAlerts = created.allergy_alerts ?? [];
      toast({
        title: allergyAlerts.length
          ? "Order placed with allergy warning"
          : "Order placed",
        description: allergyAlerts.length
          ? formatAllergyAlertMessage(allergyAlerts)
          : `${product.display_name || product.name} was added.`,
        variant: allergyAlerts.length ? "warning" : "success",
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

  if (!open) {
    return null;
  }

  return (
    <section
      className={cn("space-y-4", appFont.className)}
      data-testid="add-clinical-order-dialog"
    >
      {embedded ? null : (
        <div>
          <h3 className="text-base font-semibold tracking-tight text-brand-navy">
            Place order
          </h3>
          <p className="mt-0.5 text-sm text-dash-muted">
            Select a catalog product. Lab, radiology, and procedure services
            always charge quantity 1.
          </p>
        </div>
      )}
      <nav
        className="flex gap-1 overflow-x-auto"
        aria-label="Order catalog"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
                isActive
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-muted hover:border-brand-border hover:text-brand-navy",
              )}
              data-testid={`tabbed-dialog-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
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
      {embedded ? null : (
        <SecondaryButton
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={Boolean(busyProductUuid)}
          data-testid="clinical-order-close"
        >
          Done
        </SecondaryButton>
      )}
    </section>
  );
}
