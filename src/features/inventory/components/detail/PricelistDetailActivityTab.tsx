"use client";

import { useEffect, useState } from "react";

import {
  ActivityFeed,
  ActivityFeedSkeleton,
} from "@/components/feed/activity-feed";
import { fetchCatalogPricelistAuditEvents } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { mapPricelistActivityItems } from "@/features/inventory/utils/map-pricelist-activity-items";

type PricelistDetailActivityTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

export function PricelistDetailActivityTab({
  pricelist,
  isActive,
}: PricelistDetailActivityTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState(mapPricelistActivityItems([]));

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
        const response = await fetchCatalogPricelistAuditEvents(pricelist.uuid, {
          pageSize: 50,
        });
        if (!cancelled) {
          setItems(mapPricelistActivityItems(response.results ?? []));
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
  }, [isActive, pricelist.uuid]);

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <ActivityFeedSkeleton rows={6} />;
  }

  return (
    <ActivityFeed
      title="Activity"
      description="Recent events recorded for this pricelist."
      items={items}
      emptyTitle="No activity yet"
      emptyDescription="Creates, updates, price changes, rules, and syncs will appear here."
      data-testid="pricelist-activity-timeline"
    />
  );
}
