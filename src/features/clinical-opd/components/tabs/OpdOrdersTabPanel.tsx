"use client";

import {
  ClipboardList,
  FlaskConical,
  Package,
  Plus,
  Scan,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { AddClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/AddClinicalOrderDialog";
import { ConfirmReorderClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/ConfirmReorderClinicalOrderDialog";
import {
  useCancelOrder,
  useCreateOrder,
  useEncounterOrders,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { EncounterClinicalOrder } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  CLINICAL_ORDER_ITEM_TYPE_OPTIONS,
  getOrderItemTypesForCapabilities,
} from "@/features/clinical-opd/utils/clinical-order-item-types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type OpdOrdersTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

type OrderFilterId = "all" | "LABORATORY" | "RADIOLOGY" | "PROCEDURE" | "SUNDRY";

const ORDER_FILTERS: Array<{ id: OrderFilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "LABORATORY", label: "Lab" },
  { id: "RADIOLOGY", label: "Radiology" },
  { id: "PROCEDURE", label: "Procedures" },
  { id: "SUNDRY", label: "Sundries" },
];

const ORDER_TYPE_ICONS: Record<string, LucideIcon> = {
  LABORATORY: FlaskConical,
  RADIOLOGY: Scan,
  PROCEDURE: Stethoscope,
  SUNDRY: Package,
};

function orderTypeIcon(itemType: string): LucideIcon {
  return ORDER_TYPE_ICONS[itemType] ?? ClipboardList;
}

function matchesOrderFilter(
  order: EncounterClinicalOrder,
  filter: OrderFilterId,
): boolean {
  if (filter === "all") {
    return true;
  }
  return order.item_type === filter;
}

function canReorderOrder(
  order: EncounterClinicalOrder,
  capabilities: readonly string[],
): boolean {
  if (!order.product_uuid || order.status === "CANCELLED") {
    return false;
  }
  const option = CLINICAL_ORDER_ITEM_TYPE_OPTIONS.find(
    (item) => item.value === order.item_type,
  );
  if (!option) {
    return false;
  }
  return capabilities.includes(option.capability);
}

export function OpdOrdersTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdOrdersTabPanelProps) {
  const { toast } = useToast();
  const { capabilities } = useOpdEncounterWorkspace();
  const { data: orders = [], isLoading } = useEncounterOrders(
    visitUuid,
    encounterUuid,
  );
  const cancelOrder = useCancelOrder(visitUuid, encounterUuid);
  const createOrder = useCreateOrder(visitUuid, encounterUuid);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<OrderFilterId>("all");
  const [reorderOrder, setReorderOrder] = useState<EncounterClinicalOrder | null>(
    null,
  );
  const [isReordering, setIsReordering] = useState(false);

  const canAddOrder = getOrderItemTypesForCapabilities(capabilities).length > 0;
  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status !== "CANCELLED" && order.is_active !== false,
      ),
    [orders],
  );
  const filteredOrders = useMemo(
    () => activeOrders.filter((order) => matchesOrderFilter(order, filter)),
    [activeOrders, filter],
  );

  const handleConfirmReorder = async () => {
    if (!reorderOrder?.product_uuid) {
      return;
    }

    try {
      setIsReordering(true);
      await createOrder.mutateAsync({
        item_type: reorderOrder.item_type as ClinicalOrderItemType,
        description: reorderOrder.description || reorderOrder.item_type_display,
        product_uuid: reorderOrder.product_uuid,
        clinical_quantity: Number(reorderOrder.clinical_quantity) || 1,
        clinical_uom: reorderOrder.clinical_uom?.trim() || "Unit",
        charge_quantity: Number(reorderOrder.charge_quantity) || 1,
      });
      toast({
        title: "Order placed",
        description: `${reorderOrder.description || reorderOrder.item_type_display} was added again.`,
        variant: "success",
      });
      setReorderOrder(null);
    } catch (error) {
      toast({
        title: "Could not place order",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to create another order for this product.",
        variant: "error",
      });
    } finally {
      setIsReordering(false);
    }
  };

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const addAction = canAddOrder ? (
    <PrimaryButton
      type="button"
      size="sm"
      onClick={() => setDialogOpen(true)}
      data-testid="opd-orders-add-button"
    >
      <Plus className="size-4" aria-hidden="true" />
      Add order
    </PrimaryButton>
  ) : null;

  const filterToolbar = (
    <div
      className="flex flex-wrap gap-1.5"
      role="tablist"
      aria-label="Filter clinical orders"
      data-testid="opd-orders-type-filters"
    >
      {ORDER_FILTERS.map((option) => {
        const isSelected = filter === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setFilter(option.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-dash-border bg-white text-brand-muted hover:border-brand-border hover:text-brand-navy",
            )}
            data-testid={`opd-orders-filter-${option.id.toLowerCase()}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  const content =
    activeOrders.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={ClipboardList}
        title="No orders recorded"
        description="Laboratory, radiology, procedure, and other clinical orders for this encounter will appear here."
        action={addAction}
        data-testid="opd-orders-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title="Clinical orders"
        description="Catalog-backed orders for this encounter."
        action={addAction}
        toolbar={filterToolbar}
        data-testid="opd-orders-list"
      >
        {filteredOrders.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-brand-muted sm:px-5">
            No {ORDER_FILTERS.find((item) => item.id === filter)?.label.toLowerCase()}{" "}
            orders for this encounter.
          </li>
        ) : (
          filteredOrders.map((order) => (
            <OpdEncounterRecordListItem
              key={order.uuid}
              compact
              icon={orderTypeIcon(order.item_type)}
              title={order.description || order.item_type_display}
              badges={
                <>
                  <Badge variant="outline">
                    {order.item_type_display || order.item_type}
                  </Badge>
                  <Badge variant="secondary">
                    {order.status_display || order.status}
                  </Badge>
                </>
              }
              description={
                <p>
                  Clinical units: {order.clinical_quantity}
                  {order.clinical_uom ? ` ${order.clinical_uom}` : ""} · Charged
                  units: {order.charge_quantity}
                </p>
              }
              dateTime={order.ordered_at ?? new Date(0).toISOString()}
              createdByName={order.created_by_name}
              menuActions={
                order.status !== "CANCELLED"
                  ? [
                      {
                        label: "Cancel order",
                        onClick: () => {
                          void (async () => {
                            try {
                              await cancelOrder.mutateAsync(order.uuid);
                              toast({
                                title: "Order cancelled",
                                variant: "success",
                              });
                            } catch (error) {
                              toast({
                                title: "Could not cancel order",
                                description:
                                  error instanceof BffError
                                    ? formatBffErrorMessage(
                                        error.message,
                                        error.errors,
                                      )
                                    : "Unable to cancel this order.",
                                variant: "error",
                              });
                            }
                          })();
                        },
                      },
                    ]
                  : undefined
              }
              afterMenu={
                canReorderOrder(order, capabilities) ? (
                  <SecondaryButton
                    type="button"
                    size="icon"
                    className="size-7 rounded-full"
                    aria-label={`Add another order of ${order.description || order.item_type_display}`}
                    data-testid={`opd-orders-reorder-${order.uuid}`}
                    onClick={() => setReorderOrder(order)}
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </SecondaryButton>
                ) : null
              }
            />
          ))
        )}
      </OpdEncounterRecordList>
    );

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      {content}
      {canAddOrder ? (
        <AddClinicalOrderDialog
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          capabilities={capabilities}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      ) : null}
      <ConfirmReorderClinicalOrderDialog
        order={reorderOrder}
        open={Boolean(reorderOrder)}
        isSubmitting={isReordering}
        onOpenChange={(open) => {
          if (!open && !isReordering) {
            setReorderOrder(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmReorder();
        }}
      />
    </OpdPhysicianTabShell>
  );
}
