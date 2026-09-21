"use client";

import { useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
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
import { ConfigureLabTestAnalytesDialog } from "@/features/laboratory/components/test-detail/ConfigureLabTestAnalytesDialog";
import { useLabTestDetailWorkspace } from "@/features/laboratory/components/test-detail/lab-test-detail-workspace-context";

export function LabTestAnalytesTabPanel() {
  const { test, onTestUpdated } = useLabTestDetailWorkspace();
  const [configureOpen, setConfigureOpen] = useState(false);
  const analytes = [...(test.analytes ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const configureButton = (
    <TabAddActionButton
      label="Configure analytes"
      onClick={() => setConfigureOpen(true)}
      data-testid="configure-lab-test-analytes-button"
    />
  );

  const emptyStateButton = (
    <TabAddActionButton
      label="Configure analytes"
      emptyState
      onClick={() => setConfigureOpen(true)}
      data-testid="configure-lab-test-analytes-button"
    />
  );

  return (
    <>
      {analytes.length === 0 ? (
        <ListPageBlankState
          title="No analytes"
          description="Map analytes to this test to define reportable results."
          action={emptyStateButton}
          data-testid="lab-test-analytes-empty"
        />
      ) : (
        <div data-testid="lab-test-analytes-tab">
          <div className="mb-3 flex justify-end">{configureButton}</div>
          <ListPageDataTable>
            <ListPageDataTableHeader>
              <ListPageDataTableHeaderRow>
                <ListPageDataTableHeaderCell>Analyte</ListPageDataTableHeaderCell>
                <ListPageDataTableHeaderCell className="hidden sm:table-cell">
                  Type
                </ListPageDataTableHeaderCell>
                <ListPageDataTableHeaderCell className="hidden md:table-cell">
                  Unit
                </ListPageDataTableHeaderCell>
                <ListPageDataTableHeaderCell className="text-right">
                  Required
                </ListPageDataTableHeaderCell>
              </ListPageDataTableHeaderRow>
            </ListPageDataTableHeader>
            <ListPageDataTableBody>
              {analytes.map((item) => (
                <ListPageDataTableRow key={item.uuid}>
                <ListPageDataTableCell>
                  <p className="truncate font-medium text-brand-navy">
                    {item.analyte_name}
                  </p>
                </ListPageDataTableCell>
                  <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
                    {item.value_type || "—"}
                  </ListPageDataTableCell>
                  <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
                    {item.unit || "—"}
                  </ListPageDataTableCell>
                  <ListPageDataTableCell className="text-right text-brand-muted">
                    {item.is_required ? "Yes" : "No"}
                  </ListPageDataTableCell>
                </ListPageDataTableRow>
              ))}
            </ListPageDataTableBody>
          </ListPageDataTable>
        </div>
      )}

      <ConfigureLabTestAnalytesDialog
        test={test}
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        onUpdated={onTestUpdated}
      />
    </>
  );
}
