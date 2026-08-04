"use client";

import { Eye, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import {
  fetchPlatformAdminTenantWebhook,
  fetchPlatformAdminTenantWebhooks,
  resendPlatformAdminTenantWebhook,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminWebhookJob,
  PlatformAdminWebhookJobDetail,
} from "@/features/platform-admin/types/platform-admin.types";

const PAGE_SIZE = 20;

export function PlatformAdminTenantWebhooksTab({
  tenantUuid,
}: {
  tenantUuid: string;
}) {
  const [jobs, setJobs] = useState<PlatformAdminWebhookJob[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PlatformAdminWebhookJobDetail | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchPlatformAdminTenantWebhooks(tenantUuid, {
        page,
        pageSize: PAGE_SIZE,
        deliveryStatus:
          deliveryStatus === "all" ? undefined : deliveryStatus,
      });
      setJobs(response.results);
      setTotal(response.pagination?.count ?? response.results.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load webhooks.");
      setJobs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [deliveryStatus, page, tenantUuid]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedJobId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setIsDetailLoading(true);
    void fetchPlatformAdminTenantWebhook(tenantUuid, selectedJobId)
      .then((job) => {
        if (!cancelled) setDetail(job);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Unable to load webhook.",
          );
          setSelectedJobId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedJobId, tenantUuid]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleResend(jobId: number) {
    setIsResending(true);
    try {
      const result = await resendPlatformAdminTenantWebhook(tenantUuid, jobId);
      toast.success(
        result.delivery_status === "DELIVERED"
          ? "Webhook resent successfully"
          : "Webhook resend attempted",
      );
      await load();
      if (selectedJobId === jobId) {
        setDetail(await fetchPlatformAdminTenantWebhook(tenantUuid, jobId));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to resend webhook.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-brand-navy">Webhooks</h2>
          <p className="text-sm text-brand-muted">
            Claims-engine webhook deliveries for this tenant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={deliveryStatus}
            onValueChange={(value) => {
              setPage(1);
              setDeliveryStatus(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Delivery status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deliveries</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load()} disabled={isLoading}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            {[
              "ID",
              "Type",
              "Status",
              "Delivery",
              "Attempts",
              "Created",
              "Actions",
            ].map((column) => (
              <ListPageDataTableHeaderCell key={column}>
                {column}
              </ListPageDataTableHeaderCell>
            ))}
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {isLoading ? (
            <ListPageDataTableRow>
              <ListPageDataTableCell colSpan={7}>
                <span className="text-sm text-brand-muted">Loading webhooks…</span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <ListPageDataTableRow key={job.id}>
                <ListPageDataTableCell>{job.id}</ListPageDataTableCell>
                <ListPageDataTableCell>{job.type}</ListPageDataTableCell>
                <ListPageDataTableCell>{job.status}</ListPageDataTableCell>
                <ListPageDataTableCell>
                  <span
                    className={
                      job.delivery_status === "FAILED"
                        ? "text-red-600"
                        : job.delivery_status === "DELIVERED"
                          ? "text-emerald-700"
                          : undefined
                    }
                  >
                    {job.delivery_status}
                  </span>
                </ListPageDataTableCell>
                <ListPageDataTableCell>{job.delivery_attempts}</ListPageDataTableCell>
                <ListPageDataTableCell>{formatDate(job.created_at)}</ListPageDataTableCell>
                <ListPageDataTableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedJobId(job.id)}
                    >
                      <Eye className="mr-1 size-3.5" />
                      View
                    </Button>
                    {job.delivery_status !== "DELIVERED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isResending}
                        onClick={() => void handleResend(job.id)}
                      >
                        Resend
                      </Button>
                    ) : null}
                  </div>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            ))
          ) : (
            <ListPageDataTableRow>
              <ListPageDataTableCell colSpan={7}>
                <span className="text-sm text-brand-muted">No webhooks found.</span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          )}
        </ListPageDataTableBody>
      </ListPageDataTable>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-brand-muted">
          {total} webhook{total === 1 ? "" : "s"} · page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={selectedJobId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedJobId(null);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Webhook {selectedJobId != null ? `#${selectedJobId}` : ""}
            </DialogTitle>
          </DialogHeader>
          {isDetailLoading || !detail ? (
            <p className="text-sm text-brand-muted">Loading webhook details…</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Type" value={detail.type} />
                <Field label="Status" value={detail.status} />
                <Field label="Delivery" value={detail.delivery_status} />
                <Field label="Attempts" value={String(detail.delivery_attempts)} />
                <Field label="Created" value={formatDate(detail.created_at)} />
                <Field
                  label="Delivered"
                  value={detail.delivered_at ? formatDate(detail.delivered_at) : "Not yet"}
                />
              </div>
              {detail.delivery_error ? (
                <Field label="Delivery error" value={detail.delivery_error} />
              ) : null}
              <JsonBlock label="Payload" value={detail.payload} />
              <JsonBlock label="Outbound snapshot" value={detail.outbound_snapshot} />
              {detail.delivery_status !== "DELIVERED" ? (
                <Button
                  disabled={isResending}
                  onClick={() => void handleResend(detail.id)}
                >
                  Resend webhook
                </Button>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
      <p className="mt-1 break-words text-brand-navy">{value || "Not set"}</p>
    </div>
  );
}

function JsonBlock({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown> | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
      <pre className="mt-1 max-h-64 overflow-auto rounded-md border border-brand-border bg-brand-surface p-3 text-xs text-brand-navy">
        {value ? JSON.stringify(value, null, 2) : "None"}
      </pre>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
