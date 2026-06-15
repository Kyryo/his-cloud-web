"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { InvoiceListToolbar } from "@/features/invoices/components/InvoiceListToolbar";
import { InvoicesPageHeader } from "@/features/invoices/components/InvoicesPageHeader";
import {
  InvoicesPagination,
  InvoicesTable,
} from "@/features/invoices/components/InvoicesTable";
import { fetchInvoices } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  buildInvoiceListFilters,
  countActiveInvoiceFilters,
  DEFAULT_INVOICE_LIST_FILTERS,
  type InvoiceListFilterState,
} from "@/features/invoices/utils/invoice-list-filters";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";

const DEFAULT_PAGE_SIZE = 20;

export function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<InvoiceListFilterState>(
    DEFAULT_INVOICE_LIST_FILTERS,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listFilters = useMemo(
    () =>
      buildInvoiceListFilters({
        search: activeSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        filters,
      }),
    [activeSearch, filters, page],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setError(null);
        const response = await fetchInvoices(listFilters);
        if (cancelled) {
          return;
        }
        setInvoices(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load invoices.");
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

  const handleSearchSubmit = useCallback(() => {
    setIsRefreshing(true);
    setActiveSearch(search.trim());
    setPage(1);
  }, [search]);

  const handleClearSearch = useCallback(() => {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }, []);

  if (isLoading) {
    return <PageLoader message="Loading invoices..." />;
  }

  const activeFilterCount = countActiveInvoiceFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const hasNoRecords = invoices.length === 0 && totalCount === 0 && !hasActiveQuery;

  return (
    <ListPageLayout data-testid="invoices-page">
      <InvoicesPageHeader
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InvoiceListToolbar
            search={search}
            filters={filters}
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onFiltersApply={(nextFilters) => {
              setIsRefreshing(true);
              setFilters(nextFilters);
              setPage(1);
            }}
          />
        </ListPageDataSectionsStack>
      ) : null}

      <ListPageTableSection>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-brand-navy">No invoices found</p>
            <p className="mt-2 text-sm text-brand-muted">
              {hasActiveQuery
                ? "Try adjusting your search or filters."
                : "Invoices will appear here once sales orders are converted."}
            </p>
          </div>
        ) : (
          <>
            <InvoicesTable
              invoices={invoices}
              onRowClick={(invoice) => router.push(ROUTES.invoiceDetail(invoice.id))}
            />
            <InvoicesPagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={(nextPage) => {
                setIsRefreshing(true);
                setPage(nextPage);
              }}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
