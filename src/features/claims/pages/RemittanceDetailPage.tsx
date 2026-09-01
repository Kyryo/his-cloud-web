"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
  DetailPageHeaderSection,
  DetailPageLayout,
  DetailPageMainSection,
  ListPageDataSectionsStack,
  ListPagePagination,
  ListPageStatsSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { RemittanceDetailActions } from "@/features/claims/components/detail/RemittanceDetailActions";
import { RemittanceDetailHeader } from "@/features/claims/components/detail/RemittanceDetailHeader";
import { RemittanceDetailSummaryCards } from "@/features/claims/components/RemittanceDetailSummaryCards";
import { RemittanceImportProgress } from "@/features/claims/components/RemittanceImportProgress";
import { RemittanceMatchClaimDialog } from "@/features/claims/components/RemittanceMatchClaimDialog";
import { RemittanceRowRejectDialog } from "@/features/claims/components/RemittanceRowRejectDialog";
import { RemittanceRowDetailDialog } from "@/features/claims/components/RemittanceRowDetailDialog";
import {
  REMITTANCE_ROWS_TABLE_SKELETON_COLUMNS,
  RemittanceRowsTable,
} from "@/features/claims/components/RemittanceRowsTable";
import { RemittanceRowsToolbar } from "@/features/claims/components/RemittanceRowsToolbar";
import {
  applyRemittanceRow,
  fetchRemittanceBatch,
  fetchRemittanceBatchRowSummaryStats,
  fetchRemittanceRows,
  rejectRemittanceRow,
} from "@/features/claims/services/remittances.service";
import type {
  RemittanceBatchDetail,
  RemittanceBatchRowSummaryStats,
  RemittanceRow,
} from "@/features/claims/types/remittances.types";
import {
  countActiveRemittanceRowFilters,
  DEFAULT_REMITTANCE_ROW_LIST_FILTERS,
  type RemittanceRowListFilterState,
} from "@/features/claims/utils/remittance-row-list-filters";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";
import { InventoryListTableSkeleton } from "@/features/inventory/components/list/InventoryListTable";

const DEFAULT_PAGE_SIZE = 20;

export function RemittanceDetailPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const batchId = params.batchId;
  const [batch, setBatch] = useState<RemittanceBatchDetail | null>(null);
  const [rows, setRows] = useState<RemittanceRow[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filters, setFilters] = useState<RemittanceRowListFilterState>(
    DEFAULT_REMITTANCE_ROW_LIST_FILTERS,
  );
  const [rowsRefreshKey, setRowsRefreshKey] = useState(0);
  const [rowStats, setRowStats] = useState<RemittanceBatchRowSummaryStats | null>(
    null,
  );
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingRows, setIsRefreshingRows] = useState(false);
  const [busyRowId, setBusyRowId] = useState<number | null>(null);
  const [viewRow, setViewRow] = useState<RemittanceRow | null>(null);
  const [matchRow, setMatchRow] = useState<RemittanceRow | null>(null);
  const [rejectRow, setRejectRow] = useState<RemittanceRow | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  useAppBreadcrumb(batch ? remittanceDisplayName(batch) : null);

  const activeFilterCount = countActiveRemittanceRowFilters(filters);
  const hasActiveQuery = activeSearch.length > 0 || activeFilterCount > 0;
  const isFilteredEmpty =
    !isLoading &&
    !isRefreshingRows &&
    !error &&
    batch != null &&
    rows.length === 0 &&
    hasActiveQuery;

  const rowListFilters = useMemo(
    () => ({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search: activeSearch || undefined,
      resolutionStatus:
        filters.resolutionStatus !== "all" ? filters.resolutionStatus : undefined,
    }),
    [activeSearch, filters.resolutionStatus, page],
  );

  const reloadBatch = useCallback(async () => {
    setError(null);
    try {
      const detail = await fetchRemittanceBatch(batchId);
      setBatch(detail);
      return detail;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load remittance.");
      return null;
    }
  }, [batchId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      setSearch("");
      setActiveSearch("");
      setFilters(DEFAULT_REMITTANCE_ROW_LIST_FILTERS);
      setPage(1);
      setRows([]);
      try {
        const detail = await fetchRemittanceBatch(batchId);
        if (cancelled) {
          return;
        }
        setBatch(detail);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load remittance.",
          );
          setBatch(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  useEffect(() => {
    if (!batch) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsRefreshingRows(true);
      try {
        const response = await fetchRemittanceRows(batchId, rowListFilters);
        if (cancelled) {
          return;
        }
        setRows(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous) || page > 1);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load line items.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsRefreshingRows(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batch, batchId, page, rowsRefreshKey, rowListFilters]);

  useEffect(() => {
    if (
      !batch ||
      batch.status === "queued" ||
      batch.status === "processing"
    ) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsStatsLoading(true);
      try {
        const stats = await fetchRemittanceBatchRowSummaryStats(batchId);
        if (!cancelled) {
          setRowStats(stats);
        }
      } catch {
        if (!cancelled) {
          setRowStats(null);
        }
      } finally {
        if (!cancelled) {
          setIsStatsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batch, batchId, rowsRefreshKey]);

  useEffect(() => {
    if (!batch || (batch.status !== "queued" && batch.status !== "processing")) {
      return;
    }
    const timer = window.setInterval(() => {
      void (async () => {
        const detail = await reloadBatch();
        if (
          detail &&
          detail.status !== "queued" &&
          detail.status !== "processing"
        ) {
          setRowsRefreshKey((current) => current + 1);
        }
      })();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [batch, reloadBatch]);

  function handleSearchSubmit() {
    setPage(1);
    setActiveSearch(search.trim());
  }

  function handleClearSearch() {
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handleFiltersApply(nextFilters: RemittanceRowListFilterState) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  const handleApply = useCallback(
    async (row: RemittanceRow) => {
      if (!batch) {
        return;
      }
      setBusyRowId(row.id);
      try {
        await applyRemittanceRow(batch.uuid, row.id);
        await reloadBatch();
        setRowsRefreshKey((current) => current + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Apply failed.");
      } finally {
        setBusyRowId(null);
      }
    },
    [batch, reloadBatch],
  );

  const handleReject = useCallback(
    async (row: RemittanceRow) => {
      if (!batch) {
        return;
      }
      setIsRejecting(true);
      setBusyRowId(row.id);
      try {
        await rejectRemittanceRow(batch.uuid, row.id);
        await reloadBatch();
        setRowsRefreshKey((current) => current + 1);
        setRejectRow(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reject failed.");
      } finally {
        setBusyRowId(null);
        setIsRejecting(false);
      }
    },
    [batch, reloadBatch],
  );

  if (isLoading) {
    return (
      <DetailPageLayout data-testid="remittance-detail-page">
        <DetailPageHeaderSection>
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-48" />
        </DetailPageHeaderSection>
        <DetailPageMainSection>
          <ListPageDataSectionsStack>
            <ListPageStatsSection>
              <RemittanceDetailSummaryCards isLoading />
            </ListPageStatsSection>
            <ListPageToolbarSkeleton showFilter />
          </ListPageDataSectionsStack>
          <InventoryListTableSkeleton
            columns={[...REMITTANCE_ROWS_TABLE_SKELETON_COLUMNS]}
          />
        </DetailPageMainSection>
      </DetailPageLayout>
    );
  }

  if (!batch) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Remittance not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This remittance could not be loaded."}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => router.push(ROUTES.claimsRemittances)}
        >
          Back to remittances
        </Button>
      </div>
    );
  }

  const gateFailures = Array.isArray(batch.parse_report?.gate_failures)
    ? (batch.parse_report.gate_failures as Array<Record<string, unknown>>)
    : [];
  const isImporting =
    batch.status === "queued" || batch.status === "processing";
  const showRowsSkeleton = isRefreshingRows && rows.length === 0;

  return (
    <DetailPageLayout data-testid="remittance-detail-page">
      <RemittanceDetailHeader
        batch={batch}
        actions={
          <RemittanceDetailActions
            batch={batch}
            onBatchUpdated={setBatch}
            onRematched={() => setRowsRefreshKey((current) => current + 1)}
          />
        }
      />

      <DetailPageMainSection>
        <div className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          {batch.error_message ? (
            <div
              className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
              data-testid="remittance-parse-error"
            >
              <p className="font-medium">Parse failed</p>
              <p className="mt-1">{batch.error_message}</p>
            </div>
          ) : null}

          {isImporting ? (
            <RemittanceImportProgress batch={batch} />
          ) : (
            <>
              <ListPageDataSectionsStack>
                <ListPageStatsSection>
                  <RemittanceDetailSummaryCards
                    stats={rowStats}
                    isLoading={isStatsLoading}
                  />
                </ListPageStatsSection>
                {showRowsSkeleton ? (
                  <ListPageToolbarSkeleton showFilter />
                ) : (
                  <RemittanceRowsToolbar
                    search={search}
                    filters={filters}
                    isLoading={isRefreshingRows}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    onClearSearch={handleClearSearch}
                    onFiltersApply={handleFiltersApply}
                  />
                )}
              </ListPageDataSectionsStack>

              {gateFailures.length > 0 ? (
                <div className="space-y-2" data-testid="remittance-gate-failures">
                  <h2 className="text-sm font-medium text-brand-navy">
                    Validation gates
                  </h2>
                  <ul className="space-y-1 text-sm text-brand-muted">
                    {gateFailures.map((gate, index) => (
                      <li key={`${String(gate.gate)}-${index}`}>
                        {String(gate.gate)}: {String(gate.message)}
                        {gate.expected != null
                          ? ` (expected ${String(gate.expected)}`
                          : ""}
                        {gate.actual != null
                          ? `, actual ${String(gate.actual)})`
                          : gate.expected != null
                            ? ")"
                            : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {showRowsSkeleton ? (
                <InventoryListTableSkeleton
                  columns={[...REMITTANCE_ROWS_TABLE_SKELETON_COLUMNS]}
                />
              ) : isFilteredEmpty ? (
                <div
                  className="rounded-xl border border-brand-border bg-white px-6 py-10 text-center"
                  data-testid="remittance-rows-filtered-empty"
                >
                  <p className="text-sm font-medium text-brand-navy">
                    No matching line items
                  </p>
                  <p className="mt-1 text-sm text-brand-muted">
                    Try a different search term or clear your filters.
                  </p>
                </div>
              ) : (
                <RemittanceRowsTable
                  rows={rows}
                  busyRowId={busyRowId}
                  onView={setViewRow}
                  onMatch={setMatchRow}
                  onApply={(row) => void handleApply(row)}
                  onReject={setRejectRow}
                />
              )}

              <ListPagePagination
                page={page}
                pageSize={DEFAULT_PAGE_SIZE}
                totalCount={totalCount}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                isLoading={isRefreshingRows}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </DetailPageMainSection>

      <RemittanceRowDetailDialog
        row={viewRow}
        open={viewRow != null}
        onOpenChange={(open) => {
          if (!open) {
            setViewRow(null);
          }
        }}
      />

      <RemittanceMatchClaimDialog
        batchId={batch.uuid}
        row={matchRow}
        open={matchRow != null}
        onOpenChange={(open) => {
          if (!open) {
            setMatchRow(null);
          }
        }}
        onMatched={() => {
          void reloadBatch();
          setRowsRefreshKey((current) => current + 1);
        }}
      />

      <RemittanceRowRejectDialog
        row={rejectRow}
        open={rejectRow != null}
        isSubmitting={isRejecting}
        onOpenChange={(open) => {
          if (!open) {
            setRejectRow(null);
          }
        }}
        onConfirm={() => {
          if (rejectRow) {
            void handleReject(rejectRow);
          }
        }}
      />
    </DetailPageLayout>
  );
}
