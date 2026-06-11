"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { BatchDetailHeader } from "@/features/inventory/components/detail/BatchDetailHeader";
import { BatchDetailTabs } from "@/features/inventory/components/detail/BatchDetailTabs";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { fetchInventoryBatch } from "@/features/inventory/services/batches.service";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";

type BatchDetailPageProps = {
  batchUuid: string;
};

export function BatchDetailPage({ batchUuid }: BatchDetailPageProps) {
  const [batch, setBatch] = useState<InventoryBatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(batch ? batch.batch_number : null);

  const loadBatch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventoryBatch(batchUuid);
      setBatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch.");
    } finally {
      setIsLoading(false);
    }
  }, [batchUuid]);

  useEffect(() => {
    void loadBatch();
  }, [loadBatch]);

  const handleBatchUpdated = useCallback((updated: InventoryBatch) => {
    setBatch(updated);
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading batch..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !batch) {
    return (
      <InventoryDetailNotFound
        title="Batch not found"
        message={error ?? "This batch could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-batch-detail-page">
      <BatchDetailHeader batch={batch} />
      <BatchDetailTabs batch={batch} onUpdated={handleBatchUpdated} />
    </DetailPageLayout>
  );
}
