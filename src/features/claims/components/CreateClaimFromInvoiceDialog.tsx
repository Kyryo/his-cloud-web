"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PostClaimDialog } from "@/features/claims/components/PostClaimDialog";
import { isClaimableInvoice } from "@/features/claims/utils/is-claimable-invoice";
import {
  fetchInvoice,
  fetchInvoices,
} from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import {
  formatInvoiceInsuranceLabel,
  formatInvoiceInsuranceNumber,
} from "@/features/invoices/utils/format-invoice-insurance";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type CreateClaimFromInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimCreated?: (claimId: number) => void;
};

const PAGE_SIZE = 10;

export function CreateClaimFromInvoiceDialog({
  open,
  onOpenChange,
  onClaimCreated,
}: CreateClaimFromInvoiceDialogProps) {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setActiveSearch("");
      setPage(1);
      setInvoices([]);
      setTotalCount(0);
      setError(null);
      setSelectedInvoice(null);
      setPostOpen(false);
      setIsLoadingInvoice(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || postOpen) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchInvoices({
          state: "posted",
          search: activeSearch || undefined,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        const claimable = response.results.filter(isClaimableInvoice);
        setInvoices(claimable);
        // When filtering client-side, total is approximate from this page.
        setTotalCount(
          activeSearch || claimable.length < response.results.length
            ? claimable.length + (page - 1) * PAGE_SIZE
            : (response.pagination?.count ?? response.results.length),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load invoices.",
          );
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
  }, [activeSearch, open, page, postOpen]);

  async function handleSelectInvoice(invoice: Invoice) {
    setIsLoadingInvoice(true);
    setError(null);
    try {
      const detail = await fetchInvoice(invoice.id);
      setSelectedInvoice(detail);
      setPostOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load invoice details.",
      );
    } finally {
      setIsLoadingInvoice(false);
    }
  }

  const hasNext = page * PAGE_SIZE < totalCount;
  const hasPrevious = page > 1;

  return (
    <>
      <Dialog
        open={open && !postOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onOpenChange(false);
          }
        }}
      >
        <DialogContent
          className={cn("max-h-[90vh] overflow-y-auto sm:max-w-2xl", appFont.className)}
          data-testid="create-claim-from-invoice-dialog"
        >
          <DialogHeader>
            <DialogTitle>Create claim</DialogTitle>
            <DialogDescription>
              Choose a posted insurance invoice that is ready for a claim.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="search"
                placeholder="Search invoices..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1);
                    setActiveSearch(search.trim());
                  }
                }}
                data-testid="create-claim-invoice-search"
              />
              <PrimaryButton
                type="button"
                className="shrink-0"
                onClick={() => {
                  setPage(1);
                  setActiveSearch(search.trim());
                }}
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </PrimaryButton>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="max-h-[24rem] overflow-y-auto rounded-xl border border-brand-border">
              {isLoading || isLoadingInvoice ? (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-brand-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {isLoadingInvoice ? "Loading invoice..." : "Loading invoices..."}
                </div>
              ) : invoices.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-brand-muted">
                  No claimable posted insurance invoices found.
                </p>
              ) : (
                <ul className="divide-y divide-brand-border">
                  {invoices.map((invoice) => {
                    const insuranceLabel = formatInvoiceInsuranceLabel(invoice);
                    const membership = formatInvoiceInsuranceNumber(invoice);

                    return (
                      <li key={invoice.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                          onClick={() => void handleSelectInvoice(invoice)}
                          data-testid={`create-claim-invoice-${invoice.id}`}
                        >
                          <span className="text-sm font-medium text-brand-navy">
                            {invoice.name || `Invoice #${invoice.id}`}
                          </span>
                          <span className="text-xs text-brand-muted">
                            {invoice.customer_name || "Unknown customer"}
                            {insuranceLabel !== "—" ? ` · ${insuranceLabel}` : ""}
                            {membership !== "—" ? ` · ${membership}` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-brand-muted">
                Showing page {page}
                {totalCount > 0 ? ` · up to ${PAGE_SIZE} per page` : ""}
              </p>
              <div className="flex gap-2">
                <SecondaryButton
                  type="button"
                  disabled={!hasPrevious || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  disabled={!hasNext || isLoading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </SecondaryButton>
              </div>
            </div>
          </div>

          <DialogFooter>
            <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </SecondaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedInvoice ? (
        <PostClaimDialog
          invoice={selectedInvoice}
          open={postOpen}
          onOpenChange={(nextOpen) => {
            setPostOpen(nextOpen);
            if (!nextOpen) {
              setSelectedInvoice(null);
            }
          }}
          onSuccess={(claim) => {
            setPostOpen(false);
            setSelectedInvoice(null);
            onOpenChange(false);
            onClaimCreated?.(claim.id);
          }}
        />
      ) : null}
    </>
  );
}
