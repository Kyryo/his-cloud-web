"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import type { CatalogPricelistMasmCoreSyncJob } from "@/features/catalog/types/catalog.types";
import { usePricelistMasmSyncJobPoll } from "@/features/inventory/hooks/use-pricelist-masm-sync-job-poll";
import { useToast } from "@/providers/toast-provider";

const STATUS_LABELS: Record<CatalogPricelistMasmCoreSyncJob["status"], string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

type PricelistMasmSyncJobPanelProps = {
  pricelistUuid: string;
  jobUuid: string;
  syncToastId?: string | number;
  onTerminal?: (job: CatalogPricelistMasmCoreSyncJob) => void;
  onDismiss?: () => void;
};

export function PricelistMasmSyncJobPanel({
  pricelistUuid,
  jobUuid,
  syncToastId,
  onTerminal,
  onDismiss,
}: PricelistMasmSyncJobPanelProps) {
  const { toast } = useToast();
  const terminalNotifiedRef = useRef(false);
  const [job, setJob] = useState<CatalogPricelistMasmCoreSyncJob | null>(null);

  const notifyTerminal = useCallback(
    (terminalJob: CatalogPricelistMasmCoreSyncJob) => {
      if (terminalNotifiedRef.current) {
        return;
      }
      terminalNotifiedRef.current = true;
      setJob(terminalJob);

      if (terminalJob.status === "completed") {
        const pending = terminalJob.approval_required || 0;
        toast({
          id: syncToastId,
          variant: "success",
          title: "MASM Core prices synced",
          description:
            pending > 0
              ? `Updated ${terminalJob.updated}, unchanged ${terminalJob.unchanged}, pending approval ${pending}.`
              : `Updated ${terminalJob.updated} of ${terminalJob.matched} matched tariffs (${terminalJob.unchanged} unchanged).`,
        });
      } else {
        toast({
          id: syncToastId,
          variant: "error",
          title: "MASM Core sync failed",
          description:
            terminalJob.failure_message ||
            "Prices could not be synced from MASM Core.",
        });
      }

      onTerminal?.(terminalJob);
    },
    [onTerminal, syncToastId, toast],
  );

  usePricelistMasmSyncJobPoll(pricelistUuid, jobUuid, {
    onUpdate: setJob,
    onTerminal: notifyTerminal,
  });

  const isActive = job?.status === "queued" || job?.status === "running";
  const isTerminal = job ? !isActive : false;

  return (
    <div
      className="space-y-4 rounded-xl border border-brand-border bg-white p-4"
      data-testid="pricelist-masm-sync-job-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-brand-navy">
            Syncing from MASM Core
          </h3>
          <p className="text-xs text-brand-muted">
            {job?.provider_id
              ? `Provider id ${job.provider_id}`
              : "Fetching sync status..."}
          </p>
        </div>
        {job ? (
          <Badge
            variant={
              isActive
                ? "secondary"
                : job.status === "completed"
                  ? "default"
                  : "destructive"
            }
          >
            {STATUS_LABELS[job.status]}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-brand-muted">
        <span>Matched: {job?.matched ?? 0}</span>
        <span className="text-emerald-700">Updated: {job?.updated ?? 0}</span>
        <span>Names: {job?.names_updated ?? 0}</span>
        <span>Imported: {job?.imported ?? 0}</span>
        <span>Unchanged: {job?.unchanged ?? 0}</span>
        <span>Pending approval: {job?.approval_required ?? 0}</span>
      </div>

      {isActive ? (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Sync in progress. You can keep working while prices update.
        </div>
      ) : null}

      {isTerminal && job?.status === "completed" ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          MASM Core prices were synced successfully.
        </div>
      ) : null}

      {isTerminal && job?.status === "failed" ? (
        <div className="flex items-start gap-2 text-sm text-amber-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{job.failure_message || "Sync failed."}</span>
        </div>
      ) : null}

      {isTerminal && onDismiss ? (
        <div className="flex justify-end">
          <SecondaryButton type="button" size="sm" className="rounded-full" onClick={onDismiss}>
            Dismiss
          </SecondaryButton>
        </div>
      ) : null}
    </div>
  );
}
