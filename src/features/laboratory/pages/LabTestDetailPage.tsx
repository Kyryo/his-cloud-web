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
import { EditLabTestDialog } from "@/features/laboratory/components/catalog/TestDialogs";
import { LabTestDetailActions } from "@/features/laboratory/components/test-detail/LabTestDetailActions";
import { LabTestDetailHeader } from "@/features/laboratory/components/test-detail/LabTestDetailHeader";
import { LabTestDetailTabs } from "@/features/laboratory/components/test-detail/LabTestDetailTabs";
import { LabTestDetailWorkspaceProvider } from "@/features/laboratory/components/test-detail/lab-test-detail-workspace-context";
import { LabTestSummaryPanel } from "@/features/laboratory/components/test-detail/LabTestSummaryPanel";
import { fetchLabTest } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";
import { cn } from "@/lib/utils";

type LabTestDetailPageProps = {
  testUuid: string;
  children: React.ReactNode;
};

export function LabTestDetailPage({
  testUuid,
  children,
}: LabTestDetailPageProps) {
  const [test, setTest] = useState<LabTestDefinition | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useAppBreadcrumb(test?.name ?? null);

  useEffect(() => {
    let cancelled = false;

    async function loadTest() {
      try {
        setIsLoading(true);
        const data = await fetchLabTest(testUuid);
        if (cancelled) {
          return;
        }
        setTest(data);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load laboratory test.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTest();

    return () => {
      cancelled = true;
    };
  }, [testUuid]);

  const handleTestUpdated = useCallback((updated: LabTestDefinition) => {
    setTest(updated);
    setRefreshKey((current) => current + 1);
  }, []);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading laboratory test..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !test) {
    return (
      <DetailPageNotFound
        title="Laboratory test not found"
        message={error ?? "This laboratory test could not be loaded."}
      />
    );
  }

  return (
    <LabTestDetailWorkspaceProvider
      value={{
        test,
        refreshKey,
        onTestUpdated: handleTestUpdated,
        onRefresh: () => setRefreshKey((current) => current + 1),
      }}
    >
      <DetailPageLayout data-testid="lab-test-detail-page">
        <LabTestDetailHeader
          test={test}
          actions={<LabTestDetailActions onEdit={() => setEditOpen(true)} />}
        />
        <DetailPageTabsSection>
          <LabTestDetailTabs testUuid={test.uuid} />
          <DetailPageMainAsideGrid>
            <DetailPageMainSection>{children}</DetailPageMainSection>
            <LabTestSummaryPanel
              test={test}
              className={cn(!showSummaryPanel && "hidden xl:block")}
            />
          </DetailPageMainAsideGrid>
          <FabButton
            label={
              showSummaryPanel ? "Hide test summary" : "Show test summary"
            }
            icon={PanelRight}
            variant="outline"
            hideFrom="xl"
            className="bg-white"
            onClick={() => setShowSummaryPanel((current) => !current)}
            data-testid="lab-test-summary-fab"
          />
        </DetailPageTabsSection>
      </DetailPageLayout>

      <EditLabTestDialog
        item={test}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleTestUpdated}
      />
    </LabTestDetailWorkspaceProvider>
  );
}
