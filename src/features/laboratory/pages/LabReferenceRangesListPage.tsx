"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import {
  AddReferenceRangeDialog,
  EditReferenceRangeDialog,
} from "@/features/laboratory/components/catalog/ReferenceRangeDialogs";
import { ReferenceRangesTable } from "@/features/laboratory/components/catalog/ReferenceRangesTable";
import {
  LabCatalogListShell,
  useLabCatalogList,
} from "@/features/laboratory/components/catalog/useLabCatalogList";
import {
  deactivateLabReferenceRange,
  fetchLabAnalytes,
  fetchLabReferenceRanges,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabAnalyte } from "@/features/laboratory/types/laboratory-catalog.types";
import { ROUTES } from "@/constants/routes";

const ALL_ANALYTES = "__all__";

export function LabReferenceRangesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analyteUuid = searchParams.get("analyteUuid") ?? "";
  const [analytes, setAnalytes] = useState<LabAnalyte[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchLabAnalytes({ pageSize: 200 });
        if (!cancelled) setAnalytes(response.results);
      } catch {
        if (!cancelled) setAnalytes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchList = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) =>
      fetchLabReferenceRanges({
        page,
        pageSize,
        analyteUuid: analyteUuid || undefined,
      }),
    [analyteUuid],
  );

  const list = useLabCatalogList({
    fetchList,
    deactivate: deactivateLabReferenceRange,
    entityLabel: "Reference range",
  });

  function setAnalyteFilter(nextUuid: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!nextUuid) {
      params.delete("analyteUuid");
    } else {
      params.set("analyteUuid", nextUuid);
    }
    const query = params.toString();
    router.replace(
      query
        ? `${ROUTES.labReferenceRanges}?${query}`
        : ROUTES.labReferenceRanges,
    );
    list.setPage(1);
  }

  return (
    <>
      <LabCatalogListShell
        dataTestId="lab-reference-ranges-page"
        isUnauthorized={list.isUnauthorized}
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        emptyTitle="No reference ranges"
        emptyDescription="Define normal and critical limits for analytes."
        onRetry={list.reload}
        onAdd={() => list.setAddOpen(true)}
        addLabel="Add reference range"
        header={
          <LabCatalogPageHeader
            title="Reference ranges"
            description="Age-, sex-, and specimen-specific result limits."
            addLabel="Add reference range"
            onAdd={() => list.setAddOpen(true)}
            data-testid="add-reference-range-button"
            filters={
              <div className="max-w-sm">
                <Select
                  value={analyteUuid || ALL_ANALYTES}
                  onValueChange={(value) =>
                    setAnalyteFilter(value === ALL_ANALYTES ? "" : value)
                  }
                >
                  <SelectTrigger data-testid="reference-range-analyte-filter">
                    <SelectValue placeholder="Filter by analyte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ANALYTES}>All analytes</SelectItem>
                    {analytes.map((analyte) => (
                      <SelectItem key={analyte.uuid} value={analyte.uuid}>
                        {analyte.code} — {analyte.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        }
        page={list.page}
        pageSize={list.pageSize}
        totalCount={list.totalCount}
        hasPrevious={list.hasPrevious}
        hasNext={list.hasNext}
        onPageChange={list.setPage}
        pendingDeactivateLabel={
          list.pendingDeactivate
            ? `${list.pendingDeactivate.analyte_code} (${list.pendingDeactivate.sex})`
            : null
        }
        deactivateOpen={Boolean(list.pendingDeactivate)}
        onDeactivateOpenChange={(open) => {
          if (!open) list.setPendingDeactivate(null);
        }}
        onConfirmDeactivate={list.confirmDeactivate}
        isDeactivating={Boolean(list.deactivatingUuid)}
      >
        <ReferenceRangesTable
          items={list.items}
          deactivatingUuid={list.deactivatingUuid}
          onEdit={(item) => list.setEditing(item)}
          onDeactivate={list.requestDeactivate}
        />
      </LabCatalogListShell>

      <AddReferenceRangeDialog
        open={list.addOpen}
        onOpenChange={list.setAddOpen}
        onCreated={list.handleCreated}
        defaultAnalyteUuid={analyteUuid}
      />
      <EditReferenceRangeDialog
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
