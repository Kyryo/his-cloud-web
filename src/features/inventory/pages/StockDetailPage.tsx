"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { StockDetailHeader } from "@/features/inventory/components/detail/StockDetailHeader";
import { StockDetailTabs } from "@/features/inventory/components/detail/StockDetailTabs";
import { fetchInventoryStockItem } from "@/features/inventory/services/inventory.service";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";

type StockDetailPageProps = {
  stockUuid: string;
};

export function StockDetailPage({ stockUuid }: StockDetailPageProps) {
  const [stock, setStock] = useState<InventoryStock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(
    stock ? `${stock.location_name} · Product ${stock.odoo_product_id}` : null,
  );

  const loadStock = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventoryStockItem(stockUuid);
      setStock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stock.");
    } finally {
      setIsLoading(false);
    }
  }, [stockUuid]);

  useEffect(() => {
    void loadStock();
  }, [loadStock]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading stock..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !stock) {
    return (
      <InventoryDetailNotFound
        title="Stock not found"
        message={error ?? "This stock record could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-stock-detail-page">
      <StockDetailHeader stock={stock} />
      <StockDetailTabs stock={stock} />
    </DetailPageLayout>
  );
}
