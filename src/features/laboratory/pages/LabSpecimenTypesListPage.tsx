"use client";

import { useCallback } from "react";

import {
  AddSpecimenTypeDialog,
  EditSpecimenTypeDialog,
} from "@/features/laboratory/components/catalog/SpecimenTypeDialogs";
import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import { SpecimenTypesTable } from "@/features/laboratory/components/catalog/SpecimenTypesTable";
import {
  LabCatalogListShell,
  useLabCatalogList,
} from "@/features/laboratory/components/catalog/useLabCatalogList";
import {
  deactivateLabSpecimenType,
  fetchLabSpecimenTypes,
} from "@/features/laboratory/services/laboratory-catalog.service";

export function LabSpecimenTypesListPage() {
  const fetchList = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      fetchLabSpecimenTypes({ page, pageSize }),
    [],
  );

  const list = useLabCatalogList({
    fetchList,
    deactivate: deactivateLabSpecimenType,
    entityLabel: "Specimen type",
  });

  return (
    <>
      <LabCatalogListShell
        dataTestId="lab-specimen-types-page"
        isUnauthorized={list.isUnauthorized}
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        emptyTitle="No specimen types"
        emptyDescription="Create specimen types used during collection and processing."
        onRetry={list.reload}
        onAdd={() => list.setAddOpen(true)}
        addLabel="Add specimen type"
        header={
          <LabCatalogPageHeader
            title="Specimen types"
            description="Containers and handling rules for laboratory specimens."
            addLabel="Add specimen type"
            onAdd={() => list.setAddOpen(true)}
            data-testid="add-specimen-type-button"
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
        <SpecimenTypesTable
          items={list.items}
          deactivatingUuid={list.deactivatingUuid}
          onEdit={(item) => list.setEditing(item)}
          onDeactivate={list.requestDeactivate}
        />
      </LabCatalogListShell>

      <AddSpecimenTypeDialog
        open={list.addOpen}
        onOpenChange={list.setAddOpen}
        onCreated={list.handleCreated}
      />
      <EditSpecimenTypeDialog
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
