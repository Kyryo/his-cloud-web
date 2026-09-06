"use client";

import { useEffect, useState } from "react";

import {
  ActivityFeed,
  ActivityFeedSkeleton,
} from "@/components/feed/activity-feed";
import { mapBillingActivityItems } from "@/features/billing/utils/map-billing-activity-items";
import { InvoiceDetailTabPanel } from "@/features/invoices/components/detail/InvoiceDetailTabPanel";
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

  return (
    <InvoiceDetailTabPanel
      isActive={isActive}
      data-testid="invoice-activity-tab"
      title="Activity"
      description="Recent events recorded for this invoice."
    >
      {isLoading ? (
        <ActivityFeedSkeleton rows={6} />
      ) : (
        <ActivityFeed
          items={items}
          emptyTitle="No activity yet"
          emptyDescription="Invoice events will appear here as they happen."
          data-testid="invoice-activity-timeline"
        />
      )}
    </InvoiceDetailTabPanel>
  );
}
