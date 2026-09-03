"use client";

import { useEffect, useState } from "react";

import {
  ActivityFeed,
  ActivityFeedSkeleton,
} from "@/components/feed/activity-feed";
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
    return <ActivityFeedSkeleton rows={6} />;
  }

  return (
    <ActivityFeed
      title="Activity"
      description="Recent events recorded for this sales order."
      items={items}
      emptyTitle="No activity yet"
      emptyDescription="Sales order events will appear here as they happen."
      data-testid="sales-order-activity-timeline"
    />
  );
}
