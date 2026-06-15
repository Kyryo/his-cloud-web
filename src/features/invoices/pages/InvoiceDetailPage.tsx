"use client";

import { useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { InvoiceDetailHeader } from "@/features/invoices/components/detail/InvoiceDetailHeader";
import { InvoiceDetailTabs } from "@/features/invoices/components/detail/InvoiceDetailTabs";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type InvoiceDetailPageProps = {
  invoiceId: string;
};

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(invoice?.name || (invoice ? `Invoice #${invoice.id}` : null));

  useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchInvoice(invoiceId);
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading invoice..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Invoice not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This invoice could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <DetailPageLayout data-testid="invoice-detail-page">
      <InvoiceDetailHeader invoice={invoice} />
      <InvoiceDetailTabs invoice={invoice} />
    </DetailPageLayout>
  );
}
