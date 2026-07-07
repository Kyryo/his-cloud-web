"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ReportJobStatusBadge } from "@/features/reports/components/ReportJobStatusBadge";
import { getReportTypeLabel } from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import {
  cancelReportJob,
  fetchReportJobs,
  reportDownloadUrl,
} from "@/features/reports/services/reports.service";
import type { ReportJob } from "@/features/reports/types/report-job.types";

export function ReportExportHistoryTable() {
  const { jobsVersion } = useReportExport();
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchReportJobs({ page: 1 });
      setJobs(response.results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs().catch(() => undefined);
  }, [jobsVersion, loadJobs]);

  async function handleCancel(uuid: string) {
    await cancelReportJob(uuid);
    await loadJobs();
  }

  return (
    <section aria-labelledby="export-history-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="export-history-heading"
          className="text-sm font-semibold text-brand-navy"
        >
          All exports
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadJobs()}
          disabled={isLoading}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-brand-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-tint/40 text-left text-xs text-brand-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Report</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Rows</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-brand-muted">
                  {isLoading ? "Loading exports…" : "No exports yet."}
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.uuid} className="border-t border-brand-border">
                  <td className="px-4 py-2">{getReportTypeLabel(job.report_type)}</td>
                  <td className="px-4 py-2">
                    <ReportJobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-2">{job.row_count}</td>
                  <td className="px-4 py-2">
                    {new Date(job.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {job.downloadable ? (
                        <a
                          href={reportDownloadUrl(job.uuid)}
                          className="text-brand-primary hover:underline"
                        >
                          Download
                        </a>
                      ) : null}
                      {job.status === "queued" || job.status === "running" ? (
                        <button
                          type="button"
                          className="text-brand-muted hover:text-brand-navy"
                          onClick={() => void handleCancel(job.uuid)}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
