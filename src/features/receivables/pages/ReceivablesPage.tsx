"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { InventoryTableSkeleton } from "@/features/inventory/components/tables/InventoryTableSkeleton";
import { ReceivablesDebtorsTable, RECEIVABLES_DEBTORS_SKELETON_COLUMNS } from "@/features/receivables/components/ReceivablesDebtorsTable";
import { ReceivablesInsights } from "@/features/receivables/components/ReceivablesInsights";
import { ReceivablesInvoicesTable, RECEIVABLES_INVOICES_SKELETON_COLUMNS } from "@/features/receivables/components/ReceivablesInvoicesTable";
import { ReceivablesToolbar } from "@/features/receivables/components/ReceivablesToolbar";
import {
  fetchReceivablesDebtors,
  fetchReceivablesInvoices,
  fetchReceivablesSummaryStats,
} from "@/features/receivables/services/receivables.service";
import type {
  ReceivablesDebtor,
  ReceivablesDebtorListResponse,
  ReceivablesInvoice,
  ReceivablesInvoiceListResponse,
  ReceivablesSummaryStats,
} from "@/features/receivables/types/receivables.types";
import {
  parseReceivablesAging,
  parseReceivablesPage,
  parseReceivablesView,
  receivablesHref,
} from "@/features/receivables/utils/receivables-views";
import { BffError } from "@/lib/bff-client";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 300;

export function ReceivablesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseReceivablesView(searchParams.get("view"));
  const aging = parseReceivablesAging(searchParams.get("aging"));
  const page = parseReceivablesPage(searchParams.get("page"));
  const urlSearch = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(urlSearch);
  const [query, setQuery] = useState(urlSearch);
  const [debtors, setDebtors] = useState<ReceivablesDebtor[]>([]);
  const [invoices, setInvoices] = useState<ReceivablesInvoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<ReceivablesSummaryStats | null>(null);
  const [loadedView, setLoadedView] = useState<"debtors" | "invoices" | null>(
    null,
  );
  const [reloadNonce, setReloadNonce] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim() === query) {
      return;
    }

    let cancelled = false;

    async function persistSearch() {
      await new Promise((resolve) => {
        window.setTimeout(resolve, SEARCH_DEBOUNCE_MS);
      });
      if (cancelled) {
        return;
      }
      setQuery(search.trim());
      router.replace(
        receivablesHref({
          view,
          search,
          page: 1,
          aging: view === "invoices" ? aging : null,
        }),
      );
    }

    void persistSearch();
    return () => {
      cancelled = true;
    };
  }, [aging, query, router, search, view]);

  const listFilters = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: query || undefined,
      agingBucket: view === "invoices" ? aging ?? undefined : undefined,
    }),
    [aging, page, query, view],
  );

  const load = useCallback(async () => {
    const [listResult, summaryResult] = await Promise.allSettled([
      view === "invoices"
        ? fetchReceivablesInvoices(listFilters)
        : fetchReceivablesDebtors(listFilters),
      fetchReceivablesSummaryStats(),
    ]);

    if (listResult.status === "rejected") {
      throw listResult.reason;
    }

    const stats =
      summaryResult.status === "fulfilled" ? summaryResult.value : null;

    if (view === "invoices") {
      return {
        view: "invoices" as const,
        list: listResult.value as ReceivablesInvoiceListResponse,
        stats,
      };
    }

    return {
      view: "debtors" as const,
      list: listResult.value as ReceivablesDebtorListResponse,
      stats,
    };
  }, [listFilters, view]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await load();
        if (cancelled) {
          return;
        }

        if (result.view === "invoices") {
          setInvoices(result.list.results);
        } else {
          setDebtors(result.list.results);
        }
        setTotalCount(
          result.list.pagination?.count ?? result.list.results.length,
        );
        setStats(result.stats);
        setLoadedView(result.view);
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setError(
          loadError instanceof BffError
            ? loadError.message
            : "Could not load receivables.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [load, reloadNonce]);

  const handleSearchSubmit = useCallback(() => {
    const nextQuery = search.trim();
    setQuery(nextQuery);
    router.replace(
      receivablesHref({
        view,
        search: nextQuery,
        page: 1,
        aging: view === "invoices" ? aging : null,
      }),
    );
  }, [aging, router, search, view]);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setQuery("");
    router.replace(
      receivablesHref({
        view,
        page: 1,
        aging: view === "invoices" ? aging : null,
      }),
    );
  }, [aging, router, view]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setIsRefreshing(true);
      router.replace(
        receivablesHref({
          view,
          search: query,
          page: nextPage,
          aging: view === "invoices" ? aging : null,
        }),
      );
    },
    [aging, query, router, view],
  );

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setReloadNonce((current) => current + 1);
  }, []);

  const hasNext = page * PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;
  const rows = view === "invoices" ? invoices : debtors;
  const showSkeleton = isLoading || loadedView !== view;
  const isEmpty = !showSkeleton && !error && rows.length === 0;

  return (
    <ListPageLayout data-testid="receivables-page">
      <ReceivablesToolbar
        view={view}
        search={search}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      <ListPageStatsSection>
        <ReceivablesInsights
          stats={stats}
          view={view}
          search={query}
          aging={aging}
          isLoading={isLoading && !stats}
        />
      </ListPageStatsSection>

      <ListPageTableSection>
        {showSkeleton ? (
          <InventoryTableSkeleton
            columns={
              view === "invoices"
                ? RECEIVABLES_INVOICES_SKELETON_COLUMNS
                : RECEIVABLES_DEBTORS_SKELETON_COLUMNS
            }
          />
        ) : error ? (
          <div className="py-10">
            <h2 className="text-sm font-semibold text-brand-navy">
              Could not load receivables
            </h2>
            <p className="mt-2 text-sm text-brand-muted" data-testid="receivables-error">
              {error}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={handleRetry}
            >
              Try again
            </Button>
          </div>
        ) : isEmpty ? (
          <p className="py-10 text-sm text-brand-muted" data-testid="receivables-empty">
            {query
              ? "No matching receivables."
              : view === "invoices"
                ? "No open invoices."
                : "No clients with an outstanding balance."}
          </p>
        ) : (
          <>
            {view === "invoices" ? (
              <ReceivablesInvoicesTable
                invoices={invoices}
                onRowClick={(invoice) =>
                  router.push(ROUTES.invoiceDetail(invoice.invoice_uuid))
                }
              />
            ) : (
              <ReceivablesDebtorsTable
                debtors={debtors}
                onRowClick={(debtor) =>
                  router.push(ROUTES.customerDetail(debtor.customer_uuid))
                }
              />
            )}
            <ListPagePagination
              page={page}
              pageSize={PAGE_SIZE}
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
