"use client";

import { FileText, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { RemittanceBatchStatusBadge } from "@/features/claims/components/RemittanceBatchStatusBadge";
import {
  deleteRemittanceBatch,
  renameRemittanceBatch,
} from "@/features/claims/services/remittances.service";
import type { RemittanceBatchDetail } from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type RemittanceDetailActionsProps = {
  batch: RemittanceBatchDetail;
  onBatchUpdated?: (batch: RemittanceBatchDetail) => void;
  className?: string;
};

function formatFileFormat(format: string): string {
  const normalized = format.toLowerCase();
  if (normalized === "pdf") return "PDF";
  if (normalized === "csv") return "CSV";
  if (normalized === "xlsx") return "Excel (XLSX)";
  if (normalized === "xls") return "Excel (XLS)";
  return format || "—";
}

function FileDetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-brand-muted">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-right font-medium text-brand-navy",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function RemittanceDetailActions({
  batch,
  onBatchUpdated,
  className,
}: RemittanceDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [displayFilename, setDisplayFilename] = useState(
    remittanceDisplayName(batch),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (renameOpen) {
      setDisplayFilename(remittanceDisplayName(batch));
    }
  }, [batch, renameOpen]);

  async function handleRename() {
    const nextName = displayFilename.trim();
    if (!nextName) {
      return;
    }
    setIsRenaming(true);
    try {
      const updated = await renameRemittanceBatch(batch.id, nextName);
      setRenameOpen(false);
      onBatchUpdated?.(updated);
      toast({
        variant: "success",
        title: "Remittance renamed",
        description: `Now shown as ${remittanceDisplayName(updated)}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not rename remittance",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteRemittanceBatch(batch.id);
      setDeleteOpen(false);
      toast({
        variant: "success",
        title: "Remittance deleted",
        description: `${remittanceDisplayName(batch)} was removed.`,
      });
      router.push(ROUTES.claimsRemittances);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not delete remittance",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const busy = isDeleting || isRenaming;
  const name = remittanceDisplayName(batch);

  return (
    <>
      <div className={cn("flex shrink-0 items-center", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={busy}
              aria-label="Remittance actions"
              data-testid="remittance-actions-menu-button"
            >
              <MoreVertical className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={appFont.className}>
            <DropdownMenuItem
              onClick={() => setDetailsOpen(true)}
              data-testid="remittance-file-details-menu-item"
            >
              <FileText className="size-4" aria-hidden="true" />
              File details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRenameOpen(true)}
              data-testid="remittance-rename-menu-item"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Rename file
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-700 focus:text-red-700"
              onClick={() => setDeleteOpen(true)}
              data-testid="remittance-delete-menu-item"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete remittance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent
          className={cn(
            "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
            appFont.className,
          )}
          data-testid="remittance-file-details-dialog"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="border-b border-brand-border px-6 py-5">
              <DialogTitle>File details</DialogTitle>
              <DialogDescription>
                Metadata for this remittance upload.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              <div className="rounded-xl border border-brand-border bg-slate-50/60 p-5 text-sm">
                <dl className="space-y-3">
                  <FileDetailRow label="Name" value={name} />
                  <FileDetailRow
                    label="Original name"
                    value={batch.original_filename || "—"}
                  />
                  <FileDetailRow
                    label="Format"
                    value={formatFileFormat(batch.file_format)}
                  />
                  <FileDetailRow label="Payer" value={batch.payer_code || "—"} />
                  <div className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-brand-muted">Status</dt>
                    <dd>
                      <RemittanceBatchStatusBadge status={batch.status} />
                    </dd>
                  </div>
                  <FileDetailRow
                    label="Document #"
                    value={batch.document_number || "—"}
                    mono
                  />
                  <FileDetailRow
                    label="Provider"
                    value={batch.provider_name || "—"}
                  />
                  <FileDetailRow
                    label="Payment run"
                    value={
                      batch.payment_run_date
                        ? formatDisplayDate(batch.payment_run_date)
                        : "—"
                    }
                  />
                </dl>
              </div>

              <div className="rounded-xl border border-brand-border bg-white p-5 text-sm">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
                  Processing
                </p>
                <dl className="space-y-3">
                  <FileDetailRow
                    label="Parser"
                    value={batch.parser_key || "—"}
                    mono
                  />
                  <FileDetailRow
                    label="Layout"
                    value={batch.layout_profile || "—"}
                    mono
                  />
                  <FileDetailRow
                    label="Checksum"
                    value={batch.checksum_sha256 || "—"}
                    mono
                  />
                  <FileDetailRow
                    label="Rows"
                    value={String(batch.summary?.row_count ?? "—")}
                  />
                  <FileDetailRow
                    label="Matched"
                    value={String(batch.summary?.matched ?? "—")}
                  />
                  <FileDetailRow
                    label="Unmatched"
                    value={String(batch.summary?.unmatched ?? "—")}
                  />
                  <FileDetailRow
                    label="Pending review"
                    value={String(batch.summary?.pending_review ?? "—")}
                  />
                </dl>
              </div>

              <div className="rounded-xl border border-brand-border bg-slate-50/60 p-5 text-sm">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
                  Record
                </p>
                <dl className="space-y-3">
                  <FileDetailRow label="ID" value={String(batch.id)} mono />
                  <FileDetailRow label="UUID" value={batch.uuid} mono />
                  <FileDetailRow
                    label="Uploaded"
                    value={formatDisplayDateTime(batch.created_at)}
                  />
                  <FileDetailRow
                    label="Updated"
                    value={formatDisplayDateTime(batch.updated_at)}
                  />
                </dl>
              </div>

              {batch.error_message ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-muted">
                    Error
                  </p>
                  <p className="text-brand-navy">{batch.error_message}</p>
                </div>
              ) : null}
            </div>

            <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
              <SecondaryButton type="button" onClick={() => setDetailsOpen(false)}>
                Close
              </SecondaryButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Rename remittance</DialogTitle>
            <DialogDescription>
              Update the name shown in HMIS. The original upload filename stays
              available under File details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 px-1">
            <Label htmlFor="remittance-display-filename">Display name</Label>
            <Input
              id="remittance-display-filename"
              value={displayFilename}
              onChange={(event) => setDisplayFilename(event.target.value)}
              disabled={isRenaming}
              autoFocus
              data-testid="remittance-rename-input"
            />
          </div>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isRenaming}
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isRenaming || !displayFilename.trim()}
              onClick={() => void handleRename()}
              data-testid="remittance-rename-confirm-button"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save name"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Delete remittance?</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-brand-navy">{name}</span> and
              all of its line items. Linked claim settlements are kept but
              disconnected from this remittance. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              Keep remittance
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              data-testid="remittance-delete-confirm-button"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete remittance"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
