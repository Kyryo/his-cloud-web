"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageBlankState,
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { LabOrdersEmptyState } from "@/features/laboratory/components/LabOrdersEmptyState";
import { LabOrdersPageHeader } from "@/features/laboratory/components/LabOrdersPageHeader";
import { LabOrdersTable } from "@/features/laboratory/components/LabOrdersTable";
import { LabOrdersTableSkeleton } from "@/features/laboratory/components/LabOrdersTableSkeleton";
import { fetchLabOrders } from "@/features/laboratory/services/laboratory.service";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  LAB_ORDER_ACCESSION_PARAM,
  LAB_ORDER_DATE_FROM_PARAM,
  LAB_ORDER_DATE_TO_PARAM,
  LAB_ORDER_PAGE_PARAM,
  LAB_ORDER_PRIORITY_PARAM,
  LAB_ORDER_STATUS_PARAM,
  buildLabOrderListFilters,
  countActiveLabOrderFilters,
  labOrdersHref,
  parseLabOrderPage,
  parseLabOrderPriority,
  parseLabOrderStatus,
  type LabOrderListUrlState,
} from "@/features/laboratory/utils/lab-order-list-url";

const DEFAULT_PAGE_SIZE = 20;

export function LabOrdersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseLabOrderPage(searchParams.get(LAB_ORDER_PAGE_PARAM));
  const status = parseLabOrderStatus(searchParams.get(LAB_ORDER_STATUS_PARAM));
  const priority = parseLabOrderPriority(
    searchParams.get(LAB_ORDER_PRIORITY_PARAM),
  );
  const urlAccession = searchParams.get(LAB_ORDER_ACCESSION_PARAM) ?? "";
  const dateFrom = searchParams.get(LAB_ORDER_DATE_FROM_PARAM) ?? "";
  const dateTo = searchParams.get(LAB_ORDER_DATE_TO_PARAM) ?? "";

  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [accession, setAccession] = useState(urlAccession);
  const [syncedAccession, setSyncedAccession] = useState(urlAccession);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const filters = useMemo<LabOrderListUrlState>(
    () => ({
      page,
      status,
      priority,
      accession: urlAccession,
      dateFrom,
      dateTo,
    }),
    [dateFrom, dateTo, page, priority, status, urlAccession],
  );

  if (urlAccession !== syncedAccession) {
    setSyncedAccession(urlAccession);
    setAccession(urlAccession);
  }

  const listFilters = useMemo(
    () =>
      buildLabOrderListFilters({
        ...filters,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    [filters],
  );

  const replaceList = useCallback(
    (next: LabOrderListUrlState) => {
      router.replace(
        labOrdersHref({
          page: next.page ?? page,
          status: next.status ?? status,
          priority: next.priority ?? priority,
          accession: next.accession ?? urlAccession,
          dateFrom: next.dateFrom ?? dateFrom,
          dateTo: next.dateTo ?? dateTo,
          clinic: next.clinic,
          patient: next.patient,
        }),
      );
    },
    [dateFrom, dateTo, page, priority, router, status, urlAccession],
  );

  const reloadOrders = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetchLabOrders(listFilters);
      setOrders(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
      setHasNext(Boolean(response.pagination?.next));
      setHasPrevious(Boolean(response.pagination?.previous));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load laboratory orders.";
      if (message.toLowerCase().includes("not authenticated")) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [listFilters]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setError(null);
        setIsUnauthorized(false);
        const response = await fetchLabOrders(listFilters);
        if (cancelled) {
          return;
        }
        setOrders(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load laboratory orders.";
        if (message.toLowerCase().includes("not authenticated")) {
          setIsUnauthorized(true);
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  function handleAccessionSubmit() {
    setIsRefreshing(true);
    replaceList({ accession: accession.trim(), page: 1 });
  }

  function handleClearAccession() {
    setIsRefreshing(true);
    setAccession("");
    replaceList({ accession: "", page: 1 });
  }

  function handleFiltersApply(nextFilters: LabOrderListUrlState) {
    setIsRefreshing(true);
    replaceList({ ...nextFilters, page: 1 });
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    replaceList({ page: nextPage });
  }

  function handleRowClick(order: LabOrder) {
    router.push(ROUTES.labOrderDetail(order.uuid));
  }

  if (isUnauthorized) {
    return (
      <ListPageLayout data-testid="lab-orders-page">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You are not authorized to view laboratory orders. Sign in again or
            contact your administrator.
          </p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.auth)}>
            Go to sign in
          </Button>
        </div>
      </ListPageLayout>
    );
  }

  const activeFilterCount = countActiveLabOrderFilters(filters);
  const hasActiveQuery = urlAccession.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading && !error && orders.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="lab-orders-page">
      <LabOrdersPageHeader
        accession={accession}
        filters={filters}
        isLoading={isRefreshing}
        onAccessionChange={setAccession}
        onAccessionSubmit={handleAccessionSubmit}
        onClearAccession={handleClearAccession}
        onFiltersApply={handleFiltersApply}
      />

      <ListPageTableSection>
        {isLoading ? (
          <LabOrdersTableSkeleton rows={8} />
        ) : error ? (
          <ListPageBlankState
            compact
            tone="error"
            icon="file"
            title="Could not load laboratory orders"
            description={error}
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-[13px]"
                onClick={() => void reloadOrders()}
              >
                Try again
              </Button>
            }
          />
        ) : hasNoRecords ? (
          <LabOrdersEmptyState />
        ) : isFilteredEmpty ? (
          <ListPageBlankState
            compact
            icon="search"
            title="No matching laboratory orders"
            description="Adjust your accession search or filters and try again."
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-[13px]"
                onClick={handleClearAccession}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <>
            <LabOrdersTable orders={orders} onRowClick={handleRowClick} />
            <ListPagePagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
