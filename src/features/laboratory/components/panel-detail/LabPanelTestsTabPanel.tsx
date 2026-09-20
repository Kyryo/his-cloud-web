"use client";

import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
import { ConfigureLabPanelTestsDialog } from "@/features/laboratory/components/panel-detail/ConfigureLabPanelTestsDialog";
import { useLabPanelDetailWorkspace } from "@/features/laboratory/components/panel-detail/lab-panel-detail-workspace-context";
import { updateLabPanel } from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabPanelTestMembership } from "@/features/laboratory/types/laboratory-catalog.types";
import { ROUTES } from "@/constants/routes";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

function sortedTests(tests: LabPanelTestMembership[]): LabPanelTestMembership[] {
  return [...tests].sort((a, b) => a.sort_order - b.sort_order);
}

function reorderTests(
  tests: LabPanelTestMembership[],
  fromUuid: string,
  toUuid: string,
): LabPanelTestMembership[] {
  if (fromUuid === toUuid) {
    return tests;
  }

  const fromIndex = tests.findIndex((item) => item.uuid === fromUuid);
  const toIndex = tests.findIndex((item) => item.uuid === toUuid);
  if (fromIndex < 0 || toIndex < 0) {
    return tests;
  }

  const next = [...tests];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next.map((item, index) => ({ ...item, sort_order: index }));
}

export function LabPanelTestsTabPanel() {
  const { panel, onPanelUpdated } = useLabPanelDetailWorkspace();
  const { toast } = useToast();
  const [configureOpen, setConfigureOpen] = useState(false);
  const [tests, setTests] = useState(() => sortedTests(panel.tests ?? []));
  const [draggingUuid, setDraggingUuid] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    setTests(sortedTests(panel.tests ?? []));
  }, [panel.tests]);

  async function persistOrder(nextTests: LabPanelTestMembership[]) {
    const previous = tests;
    setTests(nextTests);
    setIsSavingOrder(true);
    try {
      const updated = await updateLabPanel(panel.uuid, {
        tests: nextTests.map((item, index) => ({
          test_uuid: item.test_uuid,
          sort_order: index,
        })),
      });
      onPanelUpdated(updated);
    } catch (error) {
      setTests(previous);
      toast({
        variant: "error",
        title: "Could not reorder tests",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong while saving the order.",
      });
    } finally {
      setIsSavingOrder(false);
    }
  }

  const configureButton = (
    <TabAddActionButton
      label="Configure tests"
      onClick={() => setConfigureOpen(true)}
      data-testid="configure-lab-panel-tests-button"
    />
  );

  const emptyStateButton = (
    <TabAddActionButton
      label="Configure tests"
      emptyState
      onClick={() => setConfigureOpen(true)}
      data-testid="configure-lab-panel-tests-button"
    />
  );

  return (
    <>
      {tests.length === 0 ? (
        <ListPageBlankState
          title="No tests"
          description="Add laboratory tests to this panel for ordering and billing."
          action={emptyStateButton}
          data-testid="lab-panel-tests-empty"
        />
      ) : (
        <div data-testid="lab-panel-tests-tab" className="space-y-3">
          <div className="flex justify-end">{configureButton}</div>
          <ListPageDataTable>
            <ListPageDataTableHeader>
              <ListPageDataTableHeaderRow>
                <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
                <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
                <ListPageDataTableHeaderCell className="w-10" aria-label="Reorder" />
              </ListPageDataTableHeaderRow>
            </ListPageDataTableHeader>
            <ListPageDataTableBody>
              {tests.map((item, index) => (
                <ListPageDataTableRow
                  key={item.uuid}
                  draggable={!isSavingOrder}
                  className={cn(
                    "group",
                    draggingUuid === item.uuid && "opacity-60",
                  )}
                  onDragStart={() => {
                    if (!isSavingOrder) {
                      setDraggingUuid(item.uuid);
                    }
                  }}
                  onDragEnd={() => setDraggingUuid(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggingUuid || isSavingOrder) {
                      return;
                    }
                    const next = reorderTests(tests, draggingUuid, item.uuid);
                    setDraggingUuid(null);
                    const orderUnchanged = next.every(
                      (row, rowIndex) => row.uuid === tests[rowIndex]?.uuid,
                    );
                    if (!orderUnchanged) {
                      void persistOrder(next);
                    }
                  }}
                >
                  <ListPageDataTableCell>
                    <Link
                      href={ROUTES.labTestDetail(item.test_uuid)}
                      className="font-medium text-brand-navy transition-colors hover:text-brand-primary"
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                    >
                      {item.test_name}
                    </Link>
                  </ListPageDataTableCell>
                  <ListPageDataTableCell>
                    <span className="font-mono text-sm text-brand-muted">
                      {item.test_code}
                    </span>
                  </ListPageDataTableCell>
                  <ListPageDataTableCell className="w-10 text-brand-muted/70">
                    <button
                      type="button"
                      className={cn(
                        "cursor-grab rounded p-1 opacity-0 transition-opacity hover:bg-slate-100 active:cursor-grabbing group-hover:opacity-100",
                        isSavingOrder && "pointer-events-none opacity-0",
                      )}
                      aria-label={`Reorder test ${index + 1}`}
                      onClick={(event) => event.preventDefault()}
                      disabled={isSavingOrder}
                    >
                      <GripVertical className="size-4" aria-hidden="true" />
                    </button>
                  </ListPageDataTableCell>
                </ListPageDataTableRow>
              ))}
            </ListPageDataTableBody>
          </ListPageDataTable>
        </div>
      )}

      <ConfigureLabPanelTestsDialog
        panel={panel}
        open={configureOpen}
        onOpenChange={setConfigureOpen}
        onUpdated={onPanelUpdated}
      />
    </>
  );
}
