"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
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
import { EditLabPanelDialog } from "@/features/laboratory/components/catalog/PanelDialogs";
import { LabPanelDetailActions } from "@/features/laboratory/components/panel-detail/LabPanelDetailActions";
import { LabPanelDetailHeader } from "@/features/laboratory/components/panel-detail/LabPanelDetailHeader";
import { LabPanelDetailTabs } from "@/features/laboratory/components/panel-detail/LabPanelDetailTabs";
import { LabPanelDetailWorkspaceProvider } from "@/features/laboratory/components/panel-detail/lab-panel-detail-workspace-context";
import { LabPanelSummaryPanel } from "@/features/laboratory/components/panel-detail/LabPanelSummaryPanel";
import { fetchLabPanel } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";
import { cn } from "@/lib/utils";

type LabPanelDetailPageProps = {
  panelUuid: string;
  children: ReactNode;
};

export function LabPanelDetailPage({
  panelUuid,
  children,
}: LabPanelDetailPageProps) {
  const [panel, setPanel] = useState<LabPanel | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useAppBreadcrumb(panel?.name ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadPanel() {
      try {
        setIsLoading(true);
        const data = await fetchLabPanel(panelUuid);
        if (cancelled) {
          return;
        }
        setPanel(data);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load laboratory panel.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPanel();

    return () => {
      cancelled = true;
    };
  }, [panelUuid]);

  const handlePanelUpdated = useCallback((updated: LabPanel) => {
    setPanel(updated);
    setRefreshKey((current) => current + 1);
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading laboratory panel..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !panel) {
    return (
      <DetailPageNotFound
        title="Laboratory panel not found"
        message={error ?? "This laboratory panel could not be loaded."}
      />
    );
  }

  return (
    <LabPanelDetailWorkspaceProvider
      value={{
        panel,
        refreshKey,
        onPanelUpdated: handlePanelUpdated,
        onRefresh: () => setRefreshKey((current) => current + 1),
      }}
    >
      <DetailPageLayout data-testid="lab-panel-detail-page">
        <LabPanelDetailHeader
          panel={panel}
          actions={<LabPanelDetailActions onEdit={() => setEditOpen(true)} />}
        />
        <DetailPageTabsSection>
          <LabPanelDetailTabs panelUuid={panel.uuid} />
          <DetailPageMainAsideGrid>
            <DetailPageMainSection>{children}</DetailPageMainSection>
            <LabPanelSummaryPanel
              panel={panel}
              className={cn(!showSummaryPanel && "hidden xl:block")}
            />
          </DetailPageMainAsideGrid>
          <FabButton
            label={
              showSummaryPanel ? "Hide panel summary" : "Show panel summary"
            }
            icon={PanelRight}
            variant="outline"
            hideFrom="xl"
            className="bg-white"
            onClick={() => setShowSummaryPanel((current) => !current)}
            data-testid="lab-panel-summary-fab"
          />
        </DetailPageTabsSection>
      </DetailPageLayout>

      <EditLabPanelDialog
        item={panel}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handlePanelUpdated}
        includeTests={false}
      />
    </LabPanelDetailWorkspaceProvider>
  );
}
