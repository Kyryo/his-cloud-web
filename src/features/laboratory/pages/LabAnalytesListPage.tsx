"use client";

import { useCallback } from "react";

import {
  AddAnalyteDialog,
  EditAnalyteDialog,
} from "@/features/laboratory/components/catalog/AnalyteDialogs";
import { AnalytesTable } from "@/features/laboratory/components/catalog/AnalytesTable";
import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import {
  LabCatalogListShell,
  useLabCatalogList,
} from "@/features/laboratory/components/catalog/useLabCatalogList";
import {
  deactivateLabAnalyte,
  fetchLabAnalytes,
} from "@/features/laboratory/services/laboratory-catalog.service";

export function LabAnalytesListPage() {
  const fetchList = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      fetchLabAnalytes({ page, pageSize }),
    [],
  );

  const list = useLabCatalogList({
    fetchList,
    deactivate: deactivateLabAnalyte,
    entityLabel: "Analyte",
  });

  return (
    <>
      <LabCatalogListShell
        dataTestId="lab-analytes-page"
        isUnauthorized={list.isUnauthorized}
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        emptyTitle="No analytes"
        emptyDescription="Define measurable analytes used in laboratory results."
        onRetry={list.reload}
        onAdd={() => list.setAddOpen(true)}
        addLabel="Add analyte"
        header={
          <LabCatalogPageHeader
            title="Analytes"
            description="Measurable result components for laboratory tests."
            addLabel="Add analyte"
            onAdd={() => list.setAddOpen(true)}
            data-testid="add-analyte-button"
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
        <AnalytesTable
          items={list.items}
          deactivatingUuid={list.deactivatingUuid}
          onEdit={(item) => list.setEditing(item)}
          onDeactivate={list.requestDeactivate}
        />
      </LabCatalogListShell>

      <AddAnalyteDialog
        open={list.addOpen}
        onOpenChange={list.setAddOpen}
        onCreated={list.handleCreated}
      />
      <EditAnalyteDialog
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
