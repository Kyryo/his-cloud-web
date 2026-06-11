"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { UpdateProductDialog } from "@/features/inventory/components/UpdateProductDialog";
import { InventoryDetailNotFound } from "@/features/inventory/components/detail/InventoryDetailNotFound";
import { ProductDetailHeader } from "@/features/inventory/components/detail/ProductDetailHeader";
import { ProductDetailTabs } from "@/features/inventory/components/detail/ProductDetailTabs";
import { fetchInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";

type ProductDetailPageProps = {
  productId: string;
};

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);

  useAppBreadcrumb(product ? formatProductLabel(product) : null);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventoryProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading product..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !product) {
    return (
      <InventoryDetailNotFound
        title="Product not found"
        message={error ?? "This product could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="inventory-product-detail-page">
      <UpdateProductDialog
        product={product}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onUpdated={setProduct}
      />

      <ProductDetailHeader
        product={product}
        onUpdate={() => setUpdateOpen(true)}
      />
      <ProductDetailTabs product={product} />
    </DetailPageLayout>
  );
}
