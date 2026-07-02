"use client";

import { Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { DetailActivityTimeline } from "@/components/detail/detail-activity-timeline";
import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { mapBillingActivityItems } from "@/features/billing/utils/map-billing-activity-items";
import { fetchSalesOrderActivity } from "@/features/sales-orders/services/sales-order-activity.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

type SalesOrderDetailActivityTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

export function SalesOrderDetailActivityTab({
  order,
  isActive,
}: SalesOrderDetailActivityTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState(
    mapBillingActivityItems([]),
  );

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
        const response = await fetchSalesOrderActivity(order.id);
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
  }, [isActive, order.id]);

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
        description="Sales order events will appear here as they happen."
        data-testid="sales-order-activity-empty-state"
      />
    );
  }

  return (
    <DetailActivityTimeline
      title="Activity"
      description="Recent events recorded for this sales order."
      items={items}
      data-testid="sales-order-activity-timeline"
    />
  );
}
