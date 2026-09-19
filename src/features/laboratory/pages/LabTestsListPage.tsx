"use client";

import { useCallback } from "react";

import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import { LabTestsTable } from "@/features/laboratory/components/catalog/LabTestsTable";
import {
  AddLabTestDialog,
  EditLabTestDialog,
} from "@/features/laboratory/components/catalog/TestDialogs";
import {
  LabCatalogListShell,
  useLabCatalogList,
} from "@/features/laboratory/components/catalog/useLabCatalogList";
import {
  deactivateLabTest,
  fetchLabTests,
} from "@/features/laboratory/services/laboratory-catalog.service";

export function LabTestsListPage() {
  const fetchList = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      fetchLabTests({ page, pageSize }),
    [],
  );

  const list = useLabCatalogList({
    fetchList,
    deactivate: deactivateLabTest,
    entityLabel: "Test",
  });

  return (
    <>
      <LabCatalogListShell
        dataTestId="lab-tests-page"
        isUnauthorized={list.isUnauthorized}
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        emptyTitle="No tests"
        emptyDescription="Create laboratory tests and map their analytes."
        onRetry={list.reload}
        onAdd={() => list.setAddOpen(true)}
        addLabel="Add test"
        header={
          <LabCatalogPageHeader
            title="Tests"
            description="Orderable laboratory tests and analyte memberships."
            addLabel="Add test"
            onAdd={() => list.setAddOpen(true)}
            data-testid="add-lab-test-button"
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
        <LabTestsTable
          items={list.items}
          deactivatingUuid={list.deactivatingUuid}
          onEdit={(item) => list.setEditing(item)}
          onDeactivate={list.requestDeactivate}
        />
      </LabCatalogListShell>

      <AddLabTestDialog
        open={list.addOpen}
        onOpenChange={list.setAddOpen}
        onCreated={list.handleCreated}
      />
      <EditLabTestDialog
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
