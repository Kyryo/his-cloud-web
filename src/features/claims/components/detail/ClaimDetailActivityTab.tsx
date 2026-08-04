"use client";

import { Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { InvoiceDetailActivityTab } from "@/features/invoices/components/detail/InvoiceDetailActivityTab";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";

type ClaimDetailActivityTabProps = {
  invoiceId: number | null;
  isActive: boolean;
};

export function ClaimDetailActivityTab({
  invoiceId,
  isActive,
}: ClaimDetailActivityTabProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !invoiceId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInvoice(invoiceId);
        if (!cancelled) {
          setInvoice(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load activity.");
          setInvoice(null);
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
  }, [invoiceId, isActive]);

  if (!isActive) {
    return null;
  }

  if (!invoiceId) {
    return (
      <DetailTabEmptyState
        icon={Activity}
        title="No activity yet"
        description="Claim activity is linked through the source invoice."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-8 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading activity...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
        {error ?? "Activity could not be loaded."}
      </div>
    );
  }

  return <InvoiceDetailActivityTab invoice={invoice} isActive />;
}
