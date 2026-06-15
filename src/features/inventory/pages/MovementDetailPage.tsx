"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { MovementDetailHeader } from "@/features/inventory/components/detail/MovementDetailHeader";
import { MovementDetailTabs } from "@/features/inventory/components/detail/MovementDetailTabs";
import { fetchInventoryMovement } from "@/features/inventory/services/inventory.service";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import { formatMovementTypeLabel } from "@/features/inventory/utils/format-inventory";

type MovementDetailPageProps = {
  movementUuid: string;
};

export function MovementDetailPage({ movementUuid }: MovementDetailPageProps) {
  const [movement, setMovement] = useState<InventoryMovement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(
    movement
      ? `${formatMovementTypeLabel(movement.movement_type)} · Product ${movement.product_id}`
      : null,
  );

  const loadMovement = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventoryMovement(movementUuid);
      setMovement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movement.");
    } finally {
      setIsLoading(false);
    }
  }, [movementUuid]);

  useEffect(() => {
    void loadMovement();
  }, [loadMovement]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading movement..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !movement) {
    return (
      <InventoryDetailNotFound
        title="Movement not found"
        message={error ?? "This movement could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-movement-detail-page">
      <MovementDetailHeader movement={movement} />
      <MovementDetailTabs movement={movement} />
    </DetailPageLayout>
  );
}
