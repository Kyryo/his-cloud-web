"use client";

import { ClipboardList, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { Badge } from "@/components/ui/badge";
import { OpdEncounterRecordList } from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
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
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
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

const ORDER_TYPE_BADGE_LABELS: Record<string, string> = {
  LABORATORY: "Lab",
  RADIOLOGY: "Radiology",
  PROCEDURE: "Procedure",
  SUNDRY: "Sundry",
};

function orderTypeBadgeLabel(order: EncounterClinicalOrder): string {
  return (
    ORDER_TYPE_BADGE_LABELS[order.item_type] ||
    order.item_type_display ||
    order.item_type
  );
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
  const { capabilities, isChartLocked } = useOpdEncounterWorkspace();
  const { data: orders = [], isLoading } = useEncounterOrders(
    visitUuid,
    encounterUuid,
  );
  const cancelOrder = useCancelOrder(visitUuid, encounterUuid);
  const createOrder = useCreateOrder(visitUuid, encounterUuid);
  const [filter, setFilter] = useState<OrderFilterId>("all");
  const [reorderOrder, setReorderOrder] = useState<EncounterClinicalOrder | null>(
    null,
  );
  const [isReordering, setIsReordering] = useState(false);
  const [cancellingUuid, setCancellingUuid] = useState<string | null>(null);

  const canAddOrder =
    getOrderItemTypesForCapabilities(capabilities).length > 0 && !isChartLocked;
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

  const handleCancelOrder = async (order: EncounterClinicalOrder) => {
    try {
      setCancellingUuid(order.uuid);
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
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to cancel this order.",
        variant: "error",
      });
    } finally {
      setCancellingUuid(null);
    }
  };

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const filterToolbar = (
    <div
      className="flex flex-wrap gap-1"
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
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              isSelected
                ? "bg-white text-brand-navy shadow-2xs ring-1 ring-dash-border/80"
                : "text-brand-muted hover:bg-white/70 hover:text-brand-navy",
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
        title="No orders yet"
        description="Orders you place on the left will show up here for this visit."
        data-testid="opd-orders-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title="This visit"
        toolbar={filterToolbar}
        data-testid="opd-orders-list"
      >
        {filteredOrders.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-brand-muted sm:px-5">
            No {ORDER_FILTERS.find((item) => item.id === filter)?.label.toLowerCase()}{" "}
            orders for this encounter.
          </li>
        ) : (
          filteredOrders.map((order) => {
            const orderedAt = order.ordered_at ?? new Date(0).toISOString();
            const canCancel = order.status !== "CANCELLED";
            const isCancelling = cancellingUuid === order.uuid;

            return (
              <li
                key={order.uuid}
                className="px-4 py-2.5 sm:px-5"
                data-testid={`opd-orders-item-${order.uuid}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {order.description || order.item_type_display}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">
                        {order.status_display || order.status}
                      </Badge>
                      <Badge variant="outline">
                        {orderTypeBadgeLabel(order)}
                      </Badge>
                      <span className="inline-flex flex-wrap items-baseline gap-x-2 text-xs text-brand-muted">
                        <time dateTime={orderedAt}>
                          {formatDisplayDateTime(orderedAt)}
                        </time>
                        {order.created_by_name ? (
                          <>
                            <span className="text-dash-muted" aria-hidden="true">
                              ·
                            </span>
                            <span>{order.created_by_name}</span>
                          </>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {canReorderOrder(order, capabilities) ? (
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
                    ) : null}
                    {canCancel ? (
                      <SecondaryButton
                        type="button"
                        size="icon"
                        className="size-7 rounded-full text-brand-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Cancel order ${order.description || order.item_type_display}`}
                        data-testid={`opd-orders-cancel-${order.uuid}`}
                        disabled={isCancelling}
                        onClick={() => {
                          void handleCancelOrder(order);
                        }}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </SecondaryButton>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </OpdEncounterRecordList>
    );

  return (
    <OpdConsultLayout
      historySection="orders"
      form={
        <OpdConsultFormPanel title="Place order">
          {canAddOrder ? (
            <AddClinicalOrderDialog
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              capabilities={capabilities}
              open
              onOpenChange={() => undefined}
              embedded
            />
          ) : (
            <OpdConsultFormLocked message="Your role cannot place orders on this encounter." />
          )}
        </OpdConsultFormPanel>
      }
      content={
        <OpdConsultContentPanel title="Orders" count={activeOrders.length}>
          {content}
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
        </OpdConsultContentPanel>
      }
    />
  );
}
