"use client";

import { useCallback } from "react";

import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import { LabPanelsTable } from "@/features/laboratory/components/catalog/LabPanelsTable";
import {
  AddLabPanelDialog,
  EditLabPanelDialog,
} from "@/features/laboratory/components/catalog/PanelDialogs";
import {
  LabCatalogListShell,
  useLabCatalogList,
} from "@/features/laboratory/components/catalog/useLabCatalogList";
import {
  deactivateLabPanel,
  fetchLabPanels,
} from "@/features/laboratory/services/laboratory-catalog.service";

export function LabPanelsListPage() {
  const fetchList = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      fetchLabPanels({ page, pageSize }),
    [],
  );

  const list = useLabCatalogList({
    fetchList,
    deactivate: deactivateLabPanel,
    entityLabel: "Panel",
  });

  return (
    <>
      <LabCatalogListShell
        dataTestId="lab-panels-page"
        isUnauthorized={list.isUnauthorized}
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        emptyTitle="No panels"
        emptyDescription="Create panels that group multiple laboratory tests."
        onRetry={list.reload}
        onAdd={() => list.setAddOpen(true)}
        addLabel="Add panel"
        header={
          <LabCatalogPageHeader
            title="Panels"
            description="Bundled laboratory test panels for ordering and billing."
            addLabel="Add panel"
            onAdd={() => list.setAddOpen(true)}
            data-testid="add-lab-panel-button"
          />
        }
        page={list.page}
        pageSize={list.pageSize}
        totalCount={list.totalCount}
        hasPrevious={list.hasPrevious}
        hasNext={list.hasNext}
        onPageChange={list.setPage}
        pendingDeactivateLabel={list.pendingDeactivate?.name ?? null}
        deactivateOpen={Boolean(list.pendingDeactivate)}
        onDeactivateOpenChange={(open) => {
          if (!open) list.setPendingDeactivate(null);
        }}
        onConfirmDeactivate={list.confirmDeactivate}
        isDeactivating={Boolean(list.deactivatingUuid)}
      >
        <LabPanelsTable
          items={list.items}
          deactivatingUuid={list.deactivatingUuid}
          onEdit={(item) => list.setEditing(item)}
          onDeactivate={list.requestDeactivate}
        />
      </LabCatalogListShell>

      <AddLabPanelDialog
        open={list.addOpen}
        onOpenChange={list.setAddOpen}
        onCreated={list.handleCreated}
      />
      <EditLabPanelDialog
        item={list.editing}
        open={Boolean(list.editing)}
        onOpenChange={(open) => {
          if (!open) list.setEditing(null);
        }}
        onUpdated={list.handleUpdated}
      />
    </>
  );
}
