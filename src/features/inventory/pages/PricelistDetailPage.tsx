"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { fetchCatalogPricelist } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { PricelistDetailHeader } from "@/features/inventory/components/detail/PricelistDetailHeader";
import { PricelistDetailTabs } from "@/features/inventory/components/detail/PricelistDetailTabs";

type PricelistDetailPageProps = {
  pricelistUuid: string;
};

export function PricelistDetailPage({ pricelistUuid }: PricelistDetailPageProps) {
  const [pricelist, setPricelist] = useState<CatalogPricelist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(pricelist?.name ?? null);

  const loadPricelist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCatalogPricelist(pricelistUuid);
      setPricelist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricelist.");
    } finally {
      setIsLoading(false);
    }
  }, [pricelistUuid]);

  useEffect(() => {
    void loadPricelist();
  }, [loadPricelist]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading pricelist..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !pricelist) {
    return (
      <InventoryDetailNotFound
        title="Pricelist not found"
        message={error ?? "This pricelist could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-pricelist-detail-page">
      <PricelistDetailHeader pricelist={pricelist} />
      <PricelistDetailTabs pricelist={pricelist} />
    </DetailPageLayout>
  );
}
