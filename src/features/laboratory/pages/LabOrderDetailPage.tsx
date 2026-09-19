"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelRight } from "lucide-react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageLayout,
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageNotFound,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { LabOrderDetailActions } from "@/features/laboratory/components/detail/LabOrderDetailActions";
import { LabOrderDetailHeader } from "@/features/laboratory/components/detail/LabOrderDetailHeader";
import { LabOrderDetailTabs } from "@/features/laboratory/components/detail/LabOrderDetailTabs";
import { LabOrderDetailWorkspaceProvider } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import { LabOrderSummaryPanel } from "@/features/laboratory/components/detail/LabOrderSummaryPanel";
import { fetchLabOrder } from "@/features/laboratory/services/laboratory.service";
import type {
  LabOrder,
  LabSpecimen,
} from "@/features/laboratory/types/laboratory.types";
import { formatLabPatientName } from "@/features/laboratory/utils/format-lab-order";
import { cn } from "@/lib/utils";

type LabOrderDetailPageProps = {
  orderUuid: string;
  children: React.ReactNode;
};

export function LabOrderDetailPage({
  orderUuid,
  children,
}: LabOrderDetailPageProps) {
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [specimens, setSpecimens] = useState<LabSpecimen[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  const breadcrumbLabel = order ? formatLabPatientName(order) : null;

  useAppBreadcrumb(breadcrumbLabel);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      try {
        setIsLoading(true);
        const data = await fetchLabOrder(orderUuid);
        if (cancelled) {
          return;
        }
        setOrder(data);
        setSpecimens(data.specimens ?? []);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load laboratory order.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderUuid, refreshKey]);

  const handleOrderUpdated = useCallback((updated: LabOrder) => {
    setOrder(updated);
    if (updated.specimens) {
      setSpecimens(updated.specimens);
    }
  }, []);

  const handleSpecimensUpdated = useCallback((next: LabSpecimen[]) => {
    setSpecimens(next);
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading laboratory order..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !order) {
    return (
      <DetailPageNotFound
        title="Laboratory order not found"
        message={error ?? "This laboratory order could not be loaded."}
      />
    );
  }

  return (
    <LabOrderDetailWorkspaceProvider
      value={{
        order,
        specimens,
        refreshKey,
        onOrderUpdated: handleOrderUpdated,
        onSpecimensUpdated: handleSpecimensUpdated,
        onRefresh: () => setRefreshKey((current) => current + 1),
      }}
    >
      <DetailPageLayout data-testid="lab-order-detail-page">
        <LabOrderDetailHeader
          order={order}
          actions={
            <LabOrderDetailActions
              order={order}
              specimens={specimens}
              onOrderUpdated={handleOrderUpdated}
              onSpecimensUpdated={handleSpecimensUpdated}
            />
          }
        />
        <DetailPageTabsSection>
          <LabOrderDetailTabs orderUuid={order.uuid} />
          <DetailPageMainAsideGrid>
            <DetailPageMainSection>{children}</DetailPageMainSection>
            <LabOrderSummaryPanel
              order={order}
              className={cn(!showSummaryPanel && "hidden xl:block")}
            />
          </DetailPageMainAsideGrid>
          <FabButton
            label={
              showSummaryPanel ? "Hide order summary" : "Show order summary"
            }
            icon={PanelRight}
            variant="outline"
            hideFrom="xl"
            className="bg-white"
            onClick={() => setShowSummaryPanel((current) => !current)}
            data-testid="lab-order-summary-fab"
          />
        </DetailPageTabsSection>
      </DetailPageLayout>
    </LabOrderDetailWorkspaceProvider>
  );
}
