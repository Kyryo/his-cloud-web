"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { FilterSelectField } from "@/components/filter-select-field";
import { PrimaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { ReportJobStatusBadge } from "@/features/reports/components/ReportJobStatusBadge";
import {
  getReportCatalogItemByType,
  getReportTypeLabel,
  REPORT_CATALOG,
} from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import {
  cancelReportJob,
  fetchReportJobs,
  reportDownloadUrl,
} from "@/features/reports/services/reports.service";
import type {
  ReportJob,
  ReportJobStatus,
} from "@/features/reports/types/report-job.types";
import {
  formatReportFileSize,
  formatReportTimestamp,
} from "@/features/reports/utils/report-export-summary";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const ALL_REPORTS = "all";
const ALL_STATUSES = "all";

const STATUS_FILTERS: Array<{
  id: typeof ALL_STATUSES | ReportJobStatus;
  label: string;
}> = [
  { id: ALL_STATUSES, label: "All" },
  { id: "completed", label: "Ready" },
  { id: "running", label: "Generating" },
  { id: "queued", label: "Queued" },
  { id: "failed", label: "Failed" },
];

const REPORT_TYPE_OPTIONS = [
  { value: ALL_REPORTS, label: "All reports" },
  ...REPORT_CATALOG.map((item) => ({
    value: item.reportType,
    label: item.title,
  })),
];

function jobMetaParts(job: ReportJob): string[] {
  const parts: string[] = [];

  if (job.status === "completed") {
    parts.push(`${job.row_count.toLocaleString()} rows`);
    if (job.file_size > 0) {
      parts.push(formatReportFileSize(job.file_size));
    }
  } else if (job.status === "failed" && job.failure_message) {
    parts.push(job.failure_message);
  }

  parts.push(formatReportTimestamp(job.created_at));
  return parts;
}

function HistoryEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      data-testid="reports-history-empty"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
        <AppIcon name="file" size={22} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-brand-navy">
        {hasFilters ? "No exports match these filters" : "No exports yet"}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-brand-muted">
        {hasFilters
          ? "Try another status or report type."
          : "Generate a report from the catalog. Finished files will show up here."}
      </p>
      {hasFilters ? null : (
        <PrimaryButton asChild size="sm" className="mt-5">
          <Link href={ROUTES.reportsExports}>New export</Link>
        </PrimaryButton>
      )}
    </div>
  );
}

function HistoryRow({
  job,
  onCancel,
}: {
  job: ReportJob;
  onCancel: (uuid: string) => void;
}) {
  const catalogItem = getReportCatalogItemByType(job.report_type);
  const title = getReportTypeLabel(job.report_type);
  const canCancel = job.status === "queued" || job.status === "running";
  const meta = jobMetaParts(job);

  return (
    <li
      className="flex items-start gap-3 py-3.5"
      data-testid={`report-history-row-${job.uuid}`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
        <AppIcon name={catalogItem?.icon ?? "file"} size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {title}
          </p>
          <ReportJobStatusBadge status={job.status} />
        </div>
        {job.output_filename ? (
          <p className="mt-0.5 truncate font-mono text-xs text-brand-muted">
            {job.output_filename}
          </p>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-brand-muted">
          {meta.map((part, index) => (
            <span key={`${part}-${index}`} className="contents">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span className="min-w-0 truncate">{part}</span>
            </span>
          ))}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 pt-1">
        {job.downloadable ? (
          <a
            href={reportDownloadUrl(job.uuid)}
            className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover"
          >
            Download
          </a>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            className="text-sm text-brand-muted hover:text-brand-navy"
            onClick={() => onCancel(job.uuid)}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </li>
  );
}

export function ReportsExportHistoryList() {
  const { jobsVersion } = useReportExport();
  const [jobs, setJobs] = useState<ReportJob[] | null>(null);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    typeof ALL_STATUSES | ReportJobStatus
  >(ALL_STATUSES);
  const [reportType, setReportType] = useState(ALL_REPORTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetchReportJobs({
          page,
          reportType: reportType === ALL_REPORTS ? undefined : reportType,
          status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
        });
        if (cancelled) {
          return;
        }

        const results = response.results;
        const pagination = response.pagination;
        const nextFromLength = results.length === PAGE_SIZE;

        setJobs(results);
        setHasError(false);
        setHasNext(pagination?.next != null || (!pagination && nextFromLength));
        setHasPrevious(pagination?.previous != null || page > 1);
        setTotalCount(
          pagination?.count ??
            (nextFromLength
              ? page * PAGE_SIZE + 1
              : (page - 1) * PAGE_SIZE + results.length),
        );
      } catch {
        if (!cancelled) {
          setJobs([]);
          setHasError(true);
          setHasNext(false);
          setHasPrevious(page > 1);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [jobsVersion, page, reportType, statusFilter]);

  const isLoading = jobs === null;
  const hasFilters = statusFilter !== ALL_STATUSES || reportType !== ALL_REPORTS;

  function handleStatusChange(next: typeof ALL_STATUSES | ReportJobStatus) {
    setIsRefreshing(true);
    setStatusFilter(next);
    setPage(1);
  }

  function handleReportTypeChange(next: string) {
    setIsRefreshing(true);
    setReportType(next);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    setPage(nextPage);
  }

  async function handleCancel(uuid: string) {
    setIsRefreshing(true);
    try {
      await cancelReportJob(uuid);
      const response = await fetchReportJobs({
        page,
        reportType: reportType === ALL_REPORTS ? undefined : reportType,
        status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
      });
      setJobs(response.results);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className="space-y-4" data-testid="reports-history-list">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Export status"
        >
          {STATUS_FILTERS.map((filter) => {
            const selected = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => handleStatusChange(filter.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "bg-brand-primary text-white"
                    : "bg-brand-tint/60 text-brand-primary hover:bg-brand-tint hover:text-brand-primary-hover",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-56">
          <FilterSelectField
            id="history-report-type"
            label="Report"
            value={reportType}
            onValueChange={handleReportTypeChange}
            options={REPORT_TYPE_OPTIONS}
          />
        </div>
      </div>

      {hasError ? (
        <div
          className="rounded-xl border border-dash-border px-4 py-6 text-center"
          data-testid="reports-history-error"
        >
          <p className="text-sm font-medium text-brand-navy">
            Could not load exports
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Check your connection and try again.
          </p>
        </div>
      ) : isLoading ? (
        <ul className="divide-y divide-dash-border/60" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="flex items-start gap-3 py-3.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-48" />
              </div>
            </li>
          ))}
        </ul>
      ) : jobs.length === 0 ? (
        <HistoryEmptyState hasFilters={hasFilters} />
      ) : (
        <>
          <ul
            className={cn(
              "divide-y divide-dash-border/60",
              isRefreshing && "opacity-70",
            )}
          >
            {jobs.map((job) => (
              <HistoryRow key={job.uuid} job={job} onCancel={handleCancel} />
            ))}
          </ul>
          {totalCount > PAGE_SIZE || hasNext || hasPrevious ? (
            <ListPagePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={handlePageChange}
              isLoading={isRefreshing}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
