"use client";

import { useEffect, useState } from "react";

import { SalesOrderDetailActions } from "@/features/sales-orders/components/detail/SalesOrderDetailActions";
import { SalesOrderDetailHeader } from "@/features/sales-orders/components/detail/SalesOrderDetailHeader";
import { SalesOrderDetailTabs } from "@/features/sales-orders/components/detail/SalesOrderDetailTabs";
import { fetchSalesOrder } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  DetailPageLayout,
  DetailPageNotFound,
  DetailPageSkeleton,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type SalesOrderDetailPageProps = {
  orderId: string;
};

export function SalesOrderDetailPage({ orderId }: SalesOrderDetailPageProps) {
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDraftSplitMismatch, setHasDraftSplitMismatch] = useState(false);

  useAppBreadcrumb(order?.name || (order ? `Order #${order.id}` : null));

  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchSalesOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sales order.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <DetailPageSkeleton data-testid="sales-order-detail-skeleton" />;
  }

  if (error || !order) {
    return (
      <DetailPageNotFound
        title="Sales order not found"
        message={error ?? "This sales order could not be loaded."}
      />
    );
  }

  return (
    <DetailPageLayout data-testid="sales-order-detail-page">
      <SalesOrderDetailHeader
        order={order}
        actions={
          <SalesOrderDetailActions
            order={order}
            onOrderUpdated={(updatedOrder) => setOrder(updatedOrder)}
            hasDraftSplitMismatch={hasDraftSplitMismatch}
          />
        }
      />
      <SalesOrderDetailTabs
        order={order}
        onOrderUpdated={(updatedOrder) => setOrder(updatedOrder)}
        onSplitMismatchChange={setHasDraftSplitMismatch}
      />
    </DetailPageLayout>
  );
}
