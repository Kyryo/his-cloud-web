"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { ROUTES } from "@/constants/routes";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { ERP_SYNC_LABELS } from "@/features/customers/constants/customer-sync-labels";
import {
  countCancelledCustomerSalesOrders,
  countConfirmedCustomerSalesOrders,
  countOpenCustomerSalesOrders,
  fetchCustomerSalesOrders,
} from "@/features/customers/services/customer-billing.service";
import type { CustomerSalesOrderRecord } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  SalesOrderInvoiceStatusBadge,
  SalesOrderStateBadge,
} from "@/features/sales-orders/components/SalesOrderStatusBadge";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import type {
  SalesOrderInvoiceStatus,
  SalesOrderState,
} from "@/features/sales-orders/types/sales-order.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

const SALES_ORDERS_PAGE_SIZE = 20;
const STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerDetailSalesOrdersTabProps = {
  customer: Customer;
  isActive: boolean;
};

function formatSalesOrderMeta(order: CustomerSalesOrderRecord) {
  return [
    formatSalesOrderAmount(order.amount_total, "MWK"),
    order.invoice_status
      ? order.invoice_status.replace(/_/g, " ")
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CustomerDetailSalesOrdersTab({
  customer,
  isActive,
}: CustomerDetailSalesOrdersTabProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerSalesOrderRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadOrders = useCallback(
    async (nextOffset = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const response = await fetchCustomerSalesOrders(customer.uuid, {
          limit: SALES_ORDERS_PAGE_SIZE,
          offset: nextOffset,
        });

        setOrders((current) =>
          append ? [...current, ...response.salesOrders] : response.salesOrders,
        );
        setTotalCount(response.pagination.count);
        setHasNext(response.pagination.has_next);
        setOffset(nextOffset);
        setHasLoaded(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load sales orders.",
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [customer.uuid],
  );

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    void loadOrders(0, false);
  }, [hasLoaded, isActive, loadOrders]);

  if (!isActive) {
    return null;
  }

  if (!customer.has_synced_to_odoo) {
    return (
      <CustomerDetailTabEmptyState
        icon={ShoppingBag}
        title="Sales orders unavailable"
        description={`Billing data requires the client to be synced to ERP. ${ERP_SYNC_LABELS.notSynced}.`}
        data-testid="customer-sales-orders-sync-required"
      />
    );
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={4} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
          {loadError}
        </div>
        <Button type="button" variant="outline" onClick={() => void loadOrders(0, false)}>
          Try again
        </Button>
      </div>
    );
  }

  const openCount = countOpenCustomerSalesOrders(orders);
  const confirmedCount = countConfirmedCustomerSalesOrders(orders);
  const cancelledCount = countCancelledCustomerSalesOrders(orders);

  return (
    <div className="space-y-4" data-testid="customer-detail-sales-orders-tab">
      <StatsCard1Grid>
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Total orders"
          value={formatCompactNumber(totalCount)}
        />
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Open"
          value={formatCompactNumber(openCount)}
        />
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Confirmed"
          value={formatCompactNumber(confirmedCount)}
        />
        <StatsCard1
          className={STAT_CARD_CLASS}
          title="Cancelled"
          value={formatCompactNumber(cancelledCount)}
        />
      </StatsCard1Grid>

      {orders.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={ShoppingBag}
          title="No sales orders yet"
          description="Sales orders for this client will appear here once created in ERP."
          data-testid="customer-sales-orders-empty-state"
        />
      ) : (
        <CustomerDetailRecordList
          title="Sales orders"
          description="Orders linked to this client from ERP."
          data-testid="customer-sales-orders-list"
          footer={
            hasNext ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={() => void loadOrders(offset + SALES_ORDERS_PAGE_SIZE, true)}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            ) : null
          }
        >
          {orders.map((order) => (
            <CustomerDetailRecordListItem
              key={order.id}
              compact
              title={order.name}
              badges={
                <>
                  <SalesOrderStateBadge state={order.state as SalesOrderState} />
                  {order.invoice_status ? (
                    <SalesOrderInvoiceStatusBadge
                      status={order.invoice_status as SalesOrderInvoiceStatus}
                    />
                  ) : null}
                </>
              }
              description={formatSalesOrderMeta(order)}
              dateTime={formatDisplayDateTime(order.date_order)}
              onUpdate={() => router.push(ROUTES.salesOrderDetail(order.id))}
              updateLabel="View order"
              data-testid={`customer-sales-order-${order.id}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
    </div>
  );
}
