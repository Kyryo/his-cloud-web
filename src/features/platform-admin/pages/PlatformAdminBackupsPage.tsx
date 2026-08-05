"use client";

import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import {
  createPlatformAdminBackup,
  getPlatformAdminBackupDownload,
  listPlatformAdminBackups,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminBackupJob,
  PlatformAdminBackupTargetCode,
} from "@/features/platform-admin/types/platform-admin.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<string, StatusPillVariant> = {
  queued: "outline",
  running: "default",
  completed: "success",
  failed: "destructive",
  expired: "outline",
};

function formatBytes(size: number): string {
  if (!size || size <= 0) {
    return "—";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

type PlatformAdminBackupsPageProps = {
  target: PlatformAdminBackupTargetCode;
  title: string;
  description: string;
};

export function PlatformAdminBackupsPage({
  target,
  title,
  description,
}: PlatformAdminBackupsPageProps) {
  const [jobs, setJobs] = useState<PlatformAdminBackupJob[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasActiveJob = useMemo(
    () => jobs.some((job) => job.status === "queued" || job.status === "running"),
    [jobs],
  );

  const reload = useCallback(async () => {
    setError(null);
    try {
      const response = await listPlatformAdminBackups({
        target,
        page,
        pageSize: PAGE_SIZE,
      });
      setJobs(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load backups.");
    } finally {
      setIsLoading(false);
    }
  }, [page, target]);

  useEffect(() => {
    setIsLoading(true);
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!hasActiveJob) {
      return;
    }
    const timer = window.setInterval(() => {
      void reload();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [hasActiveJob, reload]);

  async function handleRunBackup() {
    setIsCreating(true);
    try {
      await createPlatformAdminBackup(target);
      toast.success("Backup queued.");
      setPage(1);
      await reload();
    } catch (err) {
      const message =
        err instanceof BffError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to start backup.";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDownload(job: PlatformAdminBackupJob) {
    setDownloadingUuid(job.uuid);
    try {
      const payload = await getPlatformAdminBackupDownload(job.uuid);
      window.open(payload.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create download link.",
      );
    } finally {
      setDownloadingUuid(null);
    }
  }

  return (
    <ListPageLayout data-testid={`platform-admin-backups-${target}`}>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock title={title} description={description} />
          <ListPageHeaderActions>
            <Button asChild type="button" variant="outline">
              <Link href={ROUTES.platformAdminBackups}>Back to backups</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isCreating}
              onClick={() => void reload()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button
              type="button"
              disabled={isLoading || isCreating || hasActiveJob}
              onClick={() => void handleRunBackup()}
              data-testid="platform-admin-run-backup"
            >
              {isCreating ? "Starting…" : "Run backup"}
            </Button>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        {isLoading ? (
          <PageLoader message="Loading backups..." />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-brand-navy">No backups yet</p>
            <p className="mt-1 text-sm text-brand-muted">
              Run a backup or wait for the next scheduled run (02:00 / 14:00).
            </p>
          </div>
        ) : (
          <>
            <ListPageDataTable>
              <ListPageDataTableHeader>
                <ListPageDataTableHeaderRow>
                  <ListPageDataTableHeaderCell>Created</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Trigger</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Status</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Size</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Expires</ListPageDataTableHeaderCell>
                  <ListPageDataTableHeaderCell>Actions</ListPageDataTableHeaderCell>
                </ListPageDataTableHeaderRow>
              </ListPageDataTableHeader>
              <ListPageDataTableBody>
                {jobs.map((job) => (
                  <ListPageDataTableRow key={job.uuid}>
                    <ListPageDataTableCell>
                      {formatDisplayDateTime(job.created_at)}
                    </ListPageDataTableCell>
                    <ListPageDataTableCell className="capitalize">
                      {job.trigger}
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      <StatusPill
                        label={job.status}
                        variant={STATUS_VARIANT[job.status] ?? "outline"}
                      />
                      {job.status === "failed" && job.error_message ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-red-600">
                          {job.error_message}
                        </p>
                      ) : null}
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      {formatBytes(job.size_bytes)}
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      {job.expires_at
                        ? formatDisplayDateTime(job.expires_at)
                        : "—"}
                    </ListPageDataTableCell>
                    <ListPageDataTableCell>
                      {job.status === "completed" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={downloadingUuid === job.uuid}
                          onClick={() => void handleDownload(job)}
                        >
                          <Download className="size-3.5" aria-hidden="true" />
                          Download
                        </Button>
                      ) : (
                        "—"
                      )}
                    </ListPageDataTableCell>
                  </ListPageDataTableRow>
                ))}
              </ListPageDataTableBody>
            </ListPageDataTable>
            <ListPagePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              hasPrevious={page > 1}
              hasNext={page * PAGE_SIZE < totalCount}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
