"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { ROUTES } from "@/constants/routes";
import {
  DetailPageLayout,
  DetailPageMainSection,
  ListPagePagination,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { RemittanceDetailActions } from "@/features/claims/components/detail/RemittanceDetailActions";
import { RemittanceDetailHeader } from "@/features/claims/components/detail/RemittanceDetailHeader";
import { RemittanceImportProgress } from "@/features/claims/components/RemittanceImportProgress";
import { RemittanceRowDetailDialog } from "@/features/claims/components/RemittanceRowDetailDialog";
import { RemittanceRowsTable } from "@/features/claims/components/RemittanceRowsTable";
import { RemittanceRowsToolbar } from "@/features/claims/components/RemittanceRowsToolbar";
import {
  applyRemittanceRow,
  fetchRemittanceBatch,
  fetchRemittanceRows,
  rejectRemittanceRow,
} from "@/features/claims/services/remittances.service";
import type {
  RemittanceBatchDetail,
  RemittanceRow,
} from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";

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
  const [rowsRefreshKey, setRowsRefreshKey] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingRows, setIsRefreshingRows] = useState(false);
  const [busyRowId, setBusyRowId] = useState<number | null>(null);
  const [viewRow, setViewRow] = useState<RemittanceRow | null>(null);

  useAppBreadcrumb(batch ? remittanceDisplayName(batch) : null);

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
        const response = await fetchRemittanceRows(batchId, {
          page,
          pageSize: DEFAULT_PAGE_SIZE,
          search: activeSearch || undefined,
        });
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
  }, [activeSearch, batch, batchId, page, rowsRefreshKey]);

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
    setIsRefreshingRows(true);
    setPage(1);
    setActiveSearch(search.trim());
  }

  function handleClearSearch() {
    setIsRefreshingRows(true);
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshingRows(true);
    setPage(nextPage);
  }

  const handleApply = useCallback(
    async (row: RemittanceRow) => {
      if (!batch) {
        return;
      }
      setBusyRowId(row.id);
      try {
        await applyRemittanceRow(batch.id, row.id);
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
      setBusyRowId(row.id);
      try {
        await rejectRemittanceRow(batch.id, row.id);
        await reloadBatch();
        setRowsRefreshKey((current) => current + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reject failed.");
      } finally {
        setBusyRowId(null);
      }
    },
    [batch, reloadBatch],
  );

  if (isLoading) {
    return (
      <PageLoader
        message="Loading remittance…"
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
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

  return (
    <DetailPageLayout data-testid="remittance-detail-page">
      <RemittanceDetailHeader
        batch={batch}
        actions={
          <RemittanceDetailActions
            batch={batch}
            onBatchUpdated={setBatch}
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Pay to you (sum)"
                  value={batch.summary?.sum_pay_to_provider ?? "—"}
                />
                <SummaryCard
                  label="Document total"
                  value={batch.summary?.document_total_pay_to_provider ?? "—"}
                />
                <SummaryCard
                  label="Matched"
                  value={String(batch.summary?.matched ?? 0)}
                />
                <SummaryCard
                  label="Unmatched / review"
                  value={`${batch.summary?.unmatched ?? 0} / ${batch.summary?.pending_review ?? 0}`}
                />
              </div>

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

              <RemittanceRowsToolbar
                search={search}
                isLoading={isRefreshingRows}
                onSearchChange={setSearch}
                onSearchSubmit={handleSearchSubmit}
                onClearSearch={handleClearSearch}
              />

              <RemittanceRowsTable
                rows={rows}
                busyRowId={busyRowId}
                onView={setViewRow}
                onApply={(row) => void handleApply(row)}
                onReject={(row) => void handleReject(row)}
              />
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
    </DetailPageLayout>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-3">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-brand-navy">{value}</p>
    </div>
  );
}
