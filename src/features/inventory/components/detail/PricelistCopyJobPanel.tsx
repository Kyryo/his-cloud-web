"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchCatalogPricelistCopyJobItems } from "@/features/catalog/services/catalog.service";
import type {
  CatalogPricelistCopyJob,
  CatalogPricelistCopyJobItem,
} from "@/features/catalog/types/catalog.types";
import { usePricelistCopyJobPoll } from "@/features/inventory/hooks/use-pricelist-copy-job-poll";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const STATUS_LABELS: Record<CatalogPricelistCopyJob["status"], string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  partially_completed: "Partially completed",
  failed: "Failed",
};

type PricelistCopyJobPanelProps = {
  targetPricelistUuid: string;
  jobUuid: string;
  copyToastId?: string | number;
  onTerminal?: (job: CatalogPricelistCopyJob) => void;
  onDismiss?: () => void;
};

export function PricelistCopyJobPanel({
  targetPricelistUuid,
  jobUuid,
  copyToastId,
  onTerminal,
  onDismiss,
}: PricelistCopyJobPanelProps) {
  const { toast } = useToast();
  const terminalNotifiedRef = useRef(false);
  const [job, setJob] = useState<CatalogPricelistCopyJob | null>(null);
  const [failedItems, setFailedItems] = useState<CatalogPricelistCopyJobItem[]>([]);
  const [showFailedItems, setShowFailedItems] = useState(false);
  const [isLoadingFailedItems, setIsLoadingFailedItems] = useState(false);

  const loadFailedItems = useCallback(async () => {
    setIsLoadingFailedItems(true);
    try {
      const response = await fetchCatalogPricelistCopyJobItems(
        targetPricelistUuid,
        jobUuid,
        { status: "failed", pageSize: 200 },
      );
      setFailedItems(response.results);
    } catch {
      setFailedItems([]);
    } finally {
      setIsLoadingFailedItems(false);
    }
  }, [jobUuid, targetPricelistUuid]);

  const notifyTerminal = useCallback(
    async (terminalJob: CatalogPricelistCopyJob) => {
      if (terminalNotifiedRef.current) {
        return;
      }
      terminalNotifiedRef.current = true;
      setJob(terminalJob);

      if (terminalJob.failed_items > 0) {
        setShowFailedItems(true);
        await loadFailedItems();
      }

      if (terminalJob.status === "completed") {
        toast({
          id: copyToastId,
          variant: "success",
          title: "Copy completed",
          description: `${terminalJob.succeeded_items} product${terminalJob.succeeded_items === 1 ? "" : "s"} copied successfully.`,
        });
      } else if (terminalJob.status === "partially_completed") {
        toast({
          id: copyToastId,
          variant: "warning",
          title: "Copy partially completed",
          description: `${terminalJob.succeeded_items} succeeded and ${terminalJob.failed_items} failed.`,
        });
      } else {
        toast({
          id: copyToastId,
          variant: "error",
          title: "Copy failed",
          description:
            terminalJob.failure_message || "No products were copied successfully.",
        });
      }

      onTerminal?.(terminalJob);
    },
    [copyToastId, loadFailedItems, onTerminal, toast],
  );

  usePricelistCopyJobPoll(targetPricelistUuid, jobUuid, {
    onUpdate: setJob,
    onTerminal: (terminalJob) => {
      void notifyTerminal(terminalJob);
    },
  });

  const progressValue = useMemo(() => {
    if (!job || job.total_items === 0) {
      return 0;
    }
    const processed = job.succeeded_items + job.failed_items;
    return Math.min(100, Math.round((processed / job.total_items) * 100));
  }, [job]);

  const isActive = job?.status === "queued" || job?.status === "running";
  const isTerminal = job ? !isActive : false;

  return (
    <div
      className="space-y-4 rounded-xl border border-brand-border bg-white p-4"
      data-testid="pricelist-copy-job-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-brand-navy">Copying products</h3>
          <p className="text-xs text-brand-muted">
            {job?.source_pricelist_name
              ? `From ${job.source_pricelist_name}`
              : "Fetching copy status..."}
          </p>
        </div>
        {job ? (
          <Badge
            variant={
              isActive ? "secondary" : job.status === "completed" ? "default" : "destructive"
            }
          >
            {STATUS_LABELS[job.status]}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        <Progress value={progressValue} />
        <div className="flex flex-wrap gap-4 text-xs text-brand-muted">
          <span>Total: {job?.total_items ?? 0}</span>
          <span className="text-emerald-700">Succeeded: {job?.succeeded_items ?? 0}</span>
          <span className="text-red-600">Failed: {job?.failed_items ?? 0}</span>
        </div>
      </div>

      {isActive ? (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Copy in progress. You can keep working while products are copied.
        </div>
      ) : null}

      {isTerminal && job?.status === "completed" ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          All products were copied successfully.
        </div>
      ) : null}

      {isTerminal && job && job.failed_items > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Some products could not be copied.
          </div>
          <SecondaryButton
            type="button"
            size="sm"
            className="rounded-full"
            onClick={() => setShowFailedItems((current) => !current)}
          >
            {showFailedItems ? "Hide failed items" : "Show failed items"}
          </SecondaryButton>
          {showFailedItems ? (
            <div className="overflow-hidden rounded-lg border border-brand-border">
              {isLoadingFailedItems ? (
                <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-brand-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading failed items...
                </div>
              ) : failedItems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-brand-muted">No failed items found.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {failedItems.map((item) => (
                      <tr key={item.product_uuid}>
                        <td className="px-4 py-3 font-medium text-brand-navy">
                          {item.product_name}
                        </td>
                        <td className={cn("px-4 py-3 text-brand-muted")}>
                          {item.error_message || item.error_code || "Copy failed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
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
