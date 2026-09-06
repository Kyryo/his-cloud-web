"use client";

import Link from "next/link";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { getReportTypeLabel } from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import {
  fetchReportJobs,
  reportDownloadUrl,
} from "@/features/reports/services/reports.service";
import type { ReportJob } from "@/features/reports/types/report-job.types";
import {
  formatReportFileSize,
  formatReportTimestamp,
} from "@/features/reports/utils/report-export-summary";

const MAX_RECENT_EXPORTS = 5;

function RecentExportRow({ job }: { job: ReportJob }) {
  const isActive = job.status === "queued" || job.status === "running";
  const isFailed =
    job.status === "failed" ||
    job.status === "cancelled" ||
    job.status === "expired";

  const meta = isActive
    ? job.status === "queued"
      ? "Queued"
      : "Generating"
    : isFailed
      ? job.status === "failed"
        ? "Failed"
        : job.status === "expired"
          ? "Expired"
          : "Cancelled"
      : `${job.row_count.toLocaleString()} rows`;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">
          {getReportTypeLabel(job.report_type)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-brand-muted">
          {isActive ? (
            <Loader2
              className="size-3 animate-spin text-brand-primary"
              aria-hidden="true"
            />
          ) : null}
          {isFailed ? (
            <AlertCircle className="size-3 text-destructive" aria-hidden="true" />
          ) : null}
          <span className={isFailed ? "text-destructive" : undefined}>{meta}</span>
          <span aria-hidden="true">·</span>
          <span>{formatReportTimestamp(job.created_at)}</span>
        </p>
      </div>
      {job.downloadable ? (
        <a
          href={reportDownloadUrl(job.uuid)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-brand-tint hover:text-brand-primary"
          aria-label={`Download ${getReportTypeLabel(job.report_type)} (${formatReportFileSize(job.file_size)})`}
          title={formatReportFileSize(job.file_size)}
        >
          <Download className="size-4" aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
}

export function ReportsRecentExports() {
  const { jobsVersion } = useReportExport();
  const [jobs, setJobs] = useState<ReportJob[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetchReportJobs({ page: 1 });
        if (!cancelled) {
          setJobs(response.results.slice(0, MAX_RECENT_EXPORTS));
          setHasError(false);
        }
      } catch {
        if (!cancelled) {
          setJobs([]);
          setHasError(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [jobsVersion]);

  const isLoading = jobs === null;

  return (
    <aside
      className="space-y-3"
      aria-labelledby="recent-exports-heading"
      data-testid="reports-recent-exports"
    >
      <div className="flex items-center justify-between gap-3 border-b border-dash-border/70 pb-3">
        <h2
          id="recent-exports-heading"
          className="text-sm font-semibold tracking-tight text-brand-navy"
        >
          Recent exports
        </h2>
        <Link
          href={ROUTES.reportsExportHistory}
          className="group flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-primary-hover"
        >
          <span>View all</span>
          <AppIcon
            name="chevronRight"
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {isLoading ? (
        <ul className="divide-y divide-dash-border/60" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index} className="py-2.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </li>
          ))}
        </ul>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dash-border px-4 py-6 text-center">
          <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-dash-canvas text-brand-muted">
            <AppIcon name="file" size={16} />
          </div>
          <p className="mt-3 text-sm font-medium text-brand-navy">
            {hasError ? "Exports are unavailable" : "No exports yet"}
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            {hasError
              ? "We could not load your export history right now."
              : "Pick a report to generate your first CSV."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-dash-border/60">
          {jobs.map((job) => (
            <RecentExportRow key={job.uuid} job={job} />
          ))}
        </ul>
      )}
    </aside>
  );
}
