"use client";

import { Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { DetailActivityTimeline } from "@/components/detail/detail-activity-timeline";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { mapBillingActivityItems } from "@/features/billing/utils/map-billing-activity-items";
import { fetchInvoiceActivity } from "@/features/invoices/services/invoice-activity.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";

type InvoiceDetailActivityTabProps = {
  invoice: Invoice;
  isActive: boolean;
};

export function InvoiceDetailActivityTab({
  invoice,
  isActive,
}: InvoiceDetailActivityTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState(mapBillingActivityItems([]));

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    async function loadActivity() {
      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const response = await fetchInvoiceActivity(invoice.id);
        if (!cancelled) {
          setItems(mapBillingActivityItems(response.results ?? []));
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [invoice.id, isActive]);

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-8 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading activity...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <DetailTabEmptyState
        icon={Activity}
        title="No activity yet"
        description="Invoice events will appear here as they happen."
        data-testid="invoice-activity-empty-state"
      />
    );
  }

  return (
    <DetailActivityTimeline
      title="Activity"
      description="Recent events recorded for this invoice."
      items={items}
      data-testid="invoice-activity-timeline"
    />
  );
}
