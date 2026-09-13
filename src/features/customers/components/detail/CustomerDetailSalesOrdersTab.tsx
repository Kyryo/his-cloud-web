"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
  ListPagePagination,
} from "@/features/app-shell/components/page-layout";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerSalesOrdersTable } from "@/features/customers/components/detail/CustomerSalesOrdersTable";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import {
  countCancelledCustomerSalesOrders,
  countConfirmedCustomerSalesOrders,
  countOpenCustomerSalesOrders,
  fetchCustomerSalesOrders,
} from "@/features/customers/services/customer-billing.service";
import type { CustomerSalesOrderRecord } from "@/features/customers/types/customer-billing.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { pageOffset } from "@/features/customers/utils/paginate-items";
import { formatCompactNumber } from "@/utils/format-compact-number";

const SALES_ORDERS_PAGE_SIZE = 20;

type CustomerDetailSalesOrdersTabProps = {
  customer: Customer;
  isActive: boolean;
  refreshKey?: number;
};

export function CustomerDetailSalesOrdersTab({
  customer,
  isActive,
  refreshKey = 0,
}: CustomerDetailSalesOrdersTabProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerSalesOrderRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadOrders = useCallback(async (nextPage: number) => {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const response = await fetchCustomerSalesOrders(customer.uuid, {
        limit: SALES_ORDERS_PAGE_SIZE,
        offset: pageOffset(nextPage, SALES_ORDERS_PAGE_SIZE),
      });

      setOrders(response.salesOrders);
      setTotalCount(response.pagination.count);
      setHasNext(response.pagination.has_next);
      setHasPrevious(response.pagination.has_previous ?? nextPage > 1);
      hasLoadedRef.current = true;
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load sales orders.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const response = await fetchCustomerSalesOrders(customer.uuid, {
          limit: SALES_ORDERS_PAGE_SIZE,
          offset: pageOffset(page, SALES_ORDERS_PAGE_SIZE),
        });

        if (!cancelled) {
          setOrders(response.salesOrders);
          setTotalCount(response.pagination.count);
          setHasNext(response.pagination.has_next);
          setHasPrevious(response.pagination.has_previous ?? page > 1);
          hasLoadedRef.current = true;
          setHasLoaded(true);
          setLoadError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load sales orders.",
          );
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, isActive, page, refreshKey]);

  if (!isActive) {
    return null;
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
        <Button type="button" variant="outline" onClick={() => void loadOrders(1)}>
          Try again
        </Button>
      </div>
    );
  }

  const openCount = countOpenCustomerSalesOrders(orders);
  const confirmedCount = countConfirmedCustomerSalesOrders(orders);
  const cancelledCount = countCancelledCustomerSalesOrders(orders);

  return (
    <div className="space-y-5" data-testid="customer-detail-sales-orders-tab">
      <dl className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Total orders</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatCompactNumber(totalCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">All recorded orders</p>
        </div>

        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Open / Quotations</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatCompactNumber(openCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Draft & pending orders</p>
        </div>

        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Confirmed</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatCompactNumber(confirmedCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Approved sales</p>
        </div>

        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Cancelled</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatCompactNumber(cancelledCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Voided orders</p>
        </div>
      </dl>

      {totalCount === 0 ? (
        <CustomerDetailTabEmptyState
          icon={ShoppingBag}
          title="No sales orders yet"
          description="Sales orders for this client will appear here once created in ERP."
          data-testid="customer-sales-orders-empty-state"
        />
      ) : (
        <>
          <CustomerSalesOrdersTable
            orders={orders}
            onRowClick={(order) => router.push(ROUTES.salesOrderDetail(order.id))}
          />
          <ListPagePagination
            page={page}
            pageSize={SALES_ORDERS_PAGE_SIZE}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isLoading={isRefreshing}
            onPageChange={setPage}
          />
        </>
      )}

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
    </div>
  );
}
