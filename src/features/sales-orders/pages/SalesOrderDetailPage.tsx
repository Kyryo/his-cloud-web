"use client";

import { useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { SalesOrderDetailActions } from "@/features/sales-orders/components/detail/SalesOrderDetailActions";
import { SalesOrderDetailHeader } from "@/features/sales-orders/components/detail/SalesOrderDetailHeader";
import { SalesOrderDetailTabs } from "@/features/sales-orders/components/detail/SalesOrderDetailTabs";
import { fetchSalesOrder } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type SalesOrderDetailPageProps = {
  orderId: string;
};

export function SalesOrderDetailPage({ orderId }: SalesOrderDetailPageProps) {
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return (
      <PageLoader
        message="Loading sales order..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Sales order not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This sales order could not be loaded."}
        </p>
      </div>
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
          />
        }
      />
      <SalesOrderDetailTabs
        order={order}
        onOrderUpdated={(updatedOrder) => setOrder(updatedOrder)}
      />
    </DetailPageLayout>
  );
}
