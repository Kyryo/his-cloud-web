"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
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
      {/* Seamless Cardless Stat Strip */}
      <dl className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {/* 1. Total Orders */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-blue-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Total orders
            </dt>
          </div>
          <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
            {formatCompactNumber(totalCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">All recorded orders</p>
        </div>

        {/* 2. Open Orders */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-amber-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Open / Quotations
            </dt>
          </div>
          <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
            {formatCompactNumber(openCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Draft & pending orders</p>
        </div>

        {/* 3. Confirmed Orders */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Confirmed
            </dt>
          </div>
          <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
            {formatCompactNumber(confirmedCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Approved sales</p>
        </div>

        {/* 4. Cancelled Orders */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-slate-400" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Cancelled
            </dt>
          </div>
          <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
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
            onRowClick={(order) => router.push(ROUTES.salesOrderDetail(order.uuid))}
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
