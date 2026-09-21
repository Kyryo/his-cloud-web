"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { TabAddActionButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  ListPageBlankState,
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { LabCatalogRowActions } from "@/features/laboratory/components/catalog/LabCatalogPageChrome";
import {
  AddReferenceRangeDialog,
  EditReferenceRangeDialog,
  type ReferenceRangeAnalyteOption,
} from "@/features/laboratory/components/catalog/ReferenceRangeDialogs";
import { ConfirmLabActionDialog } from "@/features/laboratory/components/detail/ConfirmLabActionDialog";
import { useLabTestDetailWorkspace } from "@/features/laboratory/components/test-detail/lab-test-detail-workspace-context";
import {
  deactivateLabReferenceRange,
  fetchLabReferenceRanges,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabReferenceRange } from "@/features/laboratory/types/laboratory-catalog.types";
import { testHasNumericAnalytes } from "@/features/laboratory/utils/lab-test-detail-tabs";
import { useToast } from "@/providers/toast-provider";

function formatLimit(value: string | number | null | undefined): string {
  return value == null || value === "" ? "—" : String(value);
}

function formatAgeBand(item: LabReferenceRange): string {
  if (item.age_min_days == null && item.age_max_days == null) {
    return "Any age";
  }
  const min = item.age_min_days == null ? "0" : String(item.age_min_days);
  const max = item.age_max_days == null ? "∞" : String(item.age_max_days);
  return `${min}–${max} days`;
}

function formatSex(sex: string): string {
  if (sex === "M") return "Male";
  if (sex === "F") return "Female";
  return "Any";
}

export function LabTestReferenceRangesTabPanel() {
  const { toast } = useToast();
  const { test, refreshKey } = useLabTestDetailWorkspace();
  const numericAnalytes = useMemo<ReferenceRangeAnalyteOption[]>(
    () =>
      [...(test.analytes ?? [])]
        .filter(
          (item) => String(item.value_type || "").toUpperCase() === "NUMERIC",
        )
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          uuid: item.analyte_uuid,
          code: item.analyte_code,
          name: item.analyte_name,
        })),
    [test.analytes],
  );
  const numericAnalyteUuids = useMemo(
    () => new Set(numericAnalytes.map((item) => item.uuid)),
    [numericAnalytes],
  );
  const hasNumeric = testHasNumericAnalytes(test.analytes);
  const defaultAnalyteUuid =
    numericAnalytes.length === 1 ? numericAnalytes[0].uuid : "";

  const [ranges, setRanges] = useState<LabReferenceRange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<LabReferenceRange | null>(null);
  const [pendingDeactivate, setPendingDeactivate] =
    useState<LabReferenceRange | null>(null);
  const [deactivatingUuid, setDeactivatingUuid] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!hasNumeric || numericAnalyteUuids.size === 0) {
      setRanges([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRanges() {
      try {
        setIsLoading(true);
        const response = await fetchLabReferenceRanges({ pageSize: 200 });
        if (cancelled) {
          return;
        }
        setRanges(
          response.results.filter((item) =>
            numericAnalyteUuids.has(item.analyte_uuid),
          ),
        );
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reference ranges.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRanges();

    return () => {
      cancelled = true;
    };
  }, [hasNumeric, numericAnalyteUuids, refreshKey, reloadToken]);

  async function confirmDeactivate() {
    if (!pendingDeactivate) return;
    const item = pendingDeactivate;
    try {
      setDeactivatingUuid(item.uuid);
      await deactivateLabReferenceRange(item.uuid);
      setRanges((current) => current.filter((row) => row.uuid !== item.uuid));
      setPendingDeactivate(null);
      toast({
        variant: "success",
        title: "Reference range deactivated",
        description: `${item.analyte_code} (${formatSex(String(item.sex))}) was removed from active ranges.`,
      });
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not deactivate reference range",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setDeactivatingUuid(null);
    }
  }

  const addButton = (
    <TabAddActionButton
      label="Add reference range"
      onClick={() => setAddOpen(true)}
      data-testid="add-lab-test-reference-range-button"
    />
  );

  const emptyStateButton = (
    <TabAddActionButton
      label="Add reference range"
      emptyState
      onClick={() => setAddOpen(true)}
      data-testid="add-lab-test-reference-range-button"
    />
  );

  const dialogs = (
    <>
      <AddReferenceRangeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(item) => {
          setRanges((current) => [item, ...current]);
        }}
        defaultAnalyteUuid={defaultAnalyteUuid}
        analyteOptions={numericAnalytes}
        lockAnalyte={numericAnalytes.length === 1}
      />
      <EditReferenceRangeDialog
        item={editing}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={(item) => {
          setRanges((current) =>
            current.map((row) => (row.uuid === item.uuid ? item : row)),
          );
          setEditing(null);
        }}
        analyteOptions={numericAnalytes}
        lockAnalyte
      />
      <ConfirmLabActionDialog
        open={Boolean(pendingDeactivate)}
        onOpenChange={(open) => {
          if (!open) setPendingDeactivate(null);
        }}
        title="Deactivate reference range"
        description={
          pendingDeactivate
            ? `Deactivate the range for “${pendingDeactivate.analyte_name}” (${formatSex(String(pendingDeactivate.sex))})? It will no longer be used for result flags.`
            : "Deactivate this reference range?"
        }
        confirmLabel="Deactivate"
        tone="danger"
        isSubmitting={Boolean(deactivatingUuid)}
        onConfirm={() => {
          void confirmDeactivate();
        }}
      >
        <p className="text-sm text-brand-slate">
          Soft-deleted ranges stay in history but are hidden from active
          interpretation.
        </p>
      </ConfirmLabActionDialog>
    </>
  );

  if (!hasNumeric) {
    return (
      <ListPageBlankState
        title="No numeric analytes"
        description="Reference ranges apply only when this test includes numeric analytes. Configure analytes first."
        data-testid="lab-test-reference-ranges-non-numeric"
      />
    );
  }

  if (isLoading) {
    return (
      <PageLoader
        message="Loading reference ranges..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error) {
    return (
      <>
        <ListPageBlankState
          title="Unable to load reference ranges"
          description={error}
          action={
            <SecondaryButton
              size="sm"
              className="h-8 px-4"
              onClick={reload}
              data-testid="lab-test-reference-ranges-retry"
            >
              Try again
            </SecondaryButton>
          }
          data-testid="lab-test-reference-ranges-error"
        />
        {dialogs}
      </>
    );
  }

  if (ranges.length === 0) {
    return (
      <>
        <ListPageBlankState
          title="No reference ranges"
          description="Define normal and critical limits for the numeric analytes on this test."
          action={emptyStateButton}
          data-testid="lab-test-reference-ranges-empty"
        />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div data-testid="lab-test-reference-ranges-tab">
        <div className="mb-3 flex justify-end">{addButton}</div>
        <ListPageDataTable>
          <ListPageDataTableHeader>
            <ListPageDataTableHeaderRow>
              <ListPageDataTableHeaderCell>Analyte</ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell className="hidden sm:table-cell">
                Sex
              </ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell className="hidden md:table-cell">
                Age
              </ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell className="hidden lg:table-cell">
                Normal
              </ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell className="hidden xl:table-cell">
                Critical
              </ListPageDataTableHeaderCell>
              <ListPageDataTableHeaderCell className="text-right">
                Actions
              </ListPageDataTableHeaderCell>
            </ListPageDataTableHeaderRow>
          </ListPageDataTableHeader>
          <ListPageDataTableBody>
            {ranges.map((item) => (
              <ListPageDataTableRow
                key={item.uuid}
                data-testid={`lab-test-reference-range-row-${item.uuid}`}
              >
                <ListPageDataTableCell>
                  <p className="truncate font-medium text-brand-navy">
                    {item.analyte_name}
                  </p>
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
                  {formatSex(String(item.sex))}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
                  {formatAgeBand(item)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden lg:table-cell text-brand-muted">
                  {formatLimit(item.low_normal)} –{" "}
                  {formatLimit(item.high_normal)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden xl:table-cell text-brand-muted">
                  {formatLimit(item.low_critical)} –{" "}
                  {formatLimit(item.high_critical)}
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <LabCatalogRowActions
                    onEdit={() => setEditing(item)}
                    onDeactivate={() => setPendingDeactivate(item)}
                    isDeactivating={deactivatingUuid === item.uuid}
                  />
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            ))}
          </ListPageDataTableBody>
        </ListPageDataTable>
      </div>
      {dialogs}
    </>
  );
}
