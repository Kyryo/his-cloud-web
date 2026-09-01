"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { PharmacyQueueEmptyState } from "@/features/dispensation/components/PharmacyQueueEmptyState";
import { PharmacyQueuePageHeader } from "@/features/dispensation/components/PharmacyQueuePageHeader";
import { PharmacyQueueTable } from "@/features/dispensation/components/PharmacyQueueTable";
import { PharmacyQueueTableSkeleton } from "@/features/dispensation/components/PharmacyQueueTableSkeleton";
import { fetchDispensationQueue } from "@/features/dispensation/services/dispensation.service";
import type { DispensationQueueItem } from "@/features/dispensation/types/dispensation.types";

const PAGE_SIZE = 20;

export function PharmacyQueuePage() {
  const router = useRouter();
  const [items, setItems] = useState<DispensationQueueItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextFromPage, setHasNextFromPage] = useState(false);

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetchDispensationQueue({
        page,
        page_size: PAGE_SIZE,
        search: activeSearch || undefined,
      });
      const results = response.results ?? [];
      setItems(results);
      setTotalCount(
        response.count ?? (page - 1) * PAGE_SIZE + results.length,
      );
      setHasNextFromPage(
        response.count != null
          ? page * PAGE_SIZE < response.count
          : results.length === PAGE_SIZE,
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load pharmacy queue.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeSearch, page]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetchDispensationQueue({
          page,
          page_size: PAGE_SIZE,
          search: activeSearch || undefined,
        });
        if (cancelled) {
          return;
        }
        const results = response.results ?? [];
        setItems(results);
        setTotalCount(
          response.count ?? (page - 1) * PAGE_SIZE + results.length,
        );
        setHasNextFromPage(
          response.count != null
            ? page * PAGE_SIZE < response.count
            : results.length === PAGE_SIZE,
        );
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load pharmacy queue.",
          );
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
  }, [activeSearch, page]);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    setActiveSearch(search.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  const hasActiveQuery = activeSearch.length > 0;
  const isFilteredEmpty =
    !isLoading && !error && items.length === 0 && hasActiveQuery;
  const hasNoRecords =
    !isLoading && !error && items.length === 0 && !hasActiveQuery;
  const hasPrevious = page > 1;

  return (
    <ListPageLayout data-testid="pharmacy-queue-page">
      <PharmacyQueuePageHeader
        search={search}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />

      <ListPageTableSection>
        {isLoading ? (
          <PharmacyQueueTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load pharmacy queue
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reload()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <PharmacyQueueEmptyState />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">
              No matching orders
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Adjust your search and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearch}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <PharmacyQueueTable
              items={items}
              onRowClick={(item) =>
                router.push(ROUTES.pharmacyQueueDetail(item.uuid))
              }
            />
            <ListPagePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNextFromPage}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
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
