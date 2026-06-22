"use client";

import { AlertTriangle, ClipboardList, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { InlineProductCombobox } from "@/features/inventory/components/detail/InlineProductCombobox";
import { InternalOrderLineBatchSelectDialog } from "@/features/inventory/components/detail/InternalOrderLineBatchSelectDialog";
import { PurchaseOrderLineBatchButton } from "@/features/inventory/components/detail/PurchaseOrderLineBatchButton";
import { PurchaseOrderPendingChangesBar } from "@/features/inventory/components/detail/PurchaseOrderPendingChangesBar";
import { useInternalOrderLinesEditor } from "@/features/inventory/hooks/use-internal-order-lines-editor";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import {
  countInternalLinesWithValidationIssues,
  countLinesMissingBatch,
  countSavedInternalLineDrafts,
  getInternalLineValidationIssues,
  lineMissingBatch,
  type InternalOrderLineDraft,
} from "@/features/inventory/types/internal-order-line-draft";
import {
  formatInventoryQuantity,
  formatProductLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type InternalOrderLinesEditorProps = {
  order: InternalOrder;
  canEdit: boolean;
  batchTrackingEnabled?: boolean;
  autoAddLine?: boolean;
  onUpdated: (order: InternalOrder) => void;
  onError: (message: string) => void;
  onStateChange?: (state: {
    lineCount: number;
    isDirty: boolean;
    draftLines: InternalOrderLineDraft[];
    validationIssueCount: number;
  }) => void;
};

function isRowEditing(
  line: InternalOrderLineDraft,
  editingRowKey: string | null,
): boolean {
  return line.isNew === true || editingRowKey === line.key;
}

export function InternalOrderLinesEditor({
  order,
  canEdit,
  batchTrackingEnabled = false,
  autoAddLine = false,
  onUpdated,
  onError,
  onStateChange,
}: InternalOrderLinesEditorProps) {
  const [batchDialogLineKey, setBatchDialogLineKey] = useState<string | null>(null);
  const [highlightedLineKeys, setHighlightedLineKeys] = useState<Set<string>>(new Set());
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);

  const editor = useInternalOrderLinesEditor({
    order,
    canEdit,
    autoAddLine,
    onUpdated,
    onError,
  });

  const batchValidationOptions = { batchTrackingEnabled };
  const batchDialogLine = useMemo(
    () => editor.draftLines.find((line) => line.key === batchDialogLineKey) ?? null,
    [batchDialogLineKey, editor.draftLines],
  );

  const lineCount = useMemo(
    () => countSavedInternalLineDrafts(editor.draftLines),
    [editor.draftLines],
  );

  const validationIssueCount = useMemo(
    () => countInternalLinesWithValidationIssues(editor.draftLines, batchValidationOptions),
    [batchValidationOptions, editor.draftLines],
  );

  const missingBatchCount = useMemo(
    () =>
      batchTrackingEnabled
        ? countLinesMissingBatch(editor.draftLines, { batchTrackingEnabled: true })
        : 0,
    [batchTrackingEnabled, editor.draftLines],
  );

  const handleReviewItems = useCallback(() => {
    const offendingKeys = editor.draftLines
      .filter((line) => getInternalLineValidationIssues(line, batchValidationOptions).length > 0)
      .map((line) => line.key);

    if (offendingKeys.length === 0) {
      return;
    }

    setHighlightedLineKeys(new Set(offendingKeys));
    document.getElementById(`io-line-row-${offendingKeys[0]}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => setHighlightedLineKeys(new Set()), 2400);
  }, [batchValidationOptions, editor.draftLines]);

  useEffect(() => {
    onStateChange?.({
      lineCount,
      isDirty: editor.isDirty,
      draftLines: editor.draftLines,
      validationIssueCount,
    });
  }, [editor.draftLines, editor.isDirty, lineCount, onStateChange, validationIssueCount]);

  useEffect(() => {
    if (missingBatchCount === 0) {
      setIsNoticeDismissed(false);
    }
  }, [missingBatchCount]);

  if (!canEdit && order.lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
        <ClipboardList className="mx-auto size-10 text-brand-muted/70" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
        <p className="mt-2 text-sm text-brand-muted">
          This internal order does not have any line items.
        </p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {order.lines.map((line, index) => (
              <tr key={line.id ?? `${line.product_id}-${index}`}>
                <td className="px-4 py-3 text-sm text-brand-muted">{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-brand-navy">
                    {line.product_name ?? `Product #${line.product_id}`}
                  </div>
                  {batchTrackingEnabled && line.batch_number ? (
                    <p className="mt-0.5 text-xs text-brand-muted">{line.batch_number}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right text-sm text-brand-slate">
                  {formatInventoryQuantity(line.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const hasRows = editor.draftLines.length > 0;

  return (
    <>
      {!hasRows ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <ClipboardList className="mx-auto size-10 text-brand-muted/70" aria-hidden="true" />
          <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
          <p className="mt-2 text-sm text-brand-muted">
            No items yet — click Add line item to get started
          </p>
          <SecondaryButton
            type="button"
            className="mt-6"
            onClick={editor.addLine}
            data-testid="add-internal-order-line-item-button"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add line item
          </SecondaryButton>
        </div>
      ) : (
        <>
          {batchTrackingEnabled && missingBatchCount > 0 && !isNoticeDismissed ? (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="size-4" aria-hidden="true" />
              <AlertTitle>
                {missingBatchCount === 1
                  ? "1 line item is missing a batch"
                  : `${missingBatchCount} line items are missing a batch`}
              </AlertTitle>
              <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>Record a batch on each line before submitting this order.</p>
                <div className="flex shrink-0 items-center gap-2">
                  <SecondaryButton type="button" size="sm" onClick={handleReviewItems}>
                    Review items
                  </SecondaryButton>
                  <SecondaryButton
                    type="button"
                    size="sm"
                    aria-label="Dismiss warning"
                    onClick={() => setIsNoticeDismissed(true)}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </SecondaryButton>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-brand-border bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                      Qty
                    </th>
                    {batchTrackingEnabled ? (
                      <th className="px-3 py-3 text-left text-sm font-medium text-brand-muted">
                        Batch
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {editor.draftLines.map((line, index) => {
                    const isEditing = isRowEditing(line, editor.editingRowKey);
                    const isHighlighted = highlightedLineKeys.has(line.key);
                    const batchComplete = Boolean(
                      line.product_id &&
                        !lineMissingBatch(line, batchValidationOptions),
                    );

                    return (
                      <tr
                        key={line.key}
                        id={`io-line-row-${line.key}`}
                        className={cn(
                          "transition-colors",
                          isHighlighted && "bg-amber-50 ring-2 ring-inset ring-amber-300",
                        )}
                        onClick={() => {
                          if (!isEditing) {
                            editor.setEditingRowKey(line.key);
                            editor.setActiveRowKey(line.key);
                          }
                        }}
                      >
                        <td className="px-4 py-3 text-sm text-brand-muted">{index + 1}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <InlineProductCombobox
                              id={`io-line-product-${line.key}`}
                              value={line.product_uuid ?? null}
                              displayLabel={line.productName}
                              autoFocus={line.isNew === true}
                              onFocus={() => editor.setActiveRowKey(line.key)}
                              onSelect={(product) => {
                                editor.updateLine(line.key, {
                                  product_uuid: product.uuid,
                                  productName: formatProductLabel(product),
                                });
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Escape" && line.isNew) {
                                  event.preventDefault();
                                  editor.discardNewLine(line.key);
                                }
                              }}
                            />
                          ) : (
                            <div>
                              <span className="text-sm font-medium text-brand-navy">
                                {line.productName ?? `Product #${line.product_id ?? "?"}`}
                              </span>
                              {line.product_id && batchTrackingEnabled ? (
                                <p
                                  className={cn(
                                    "mt-0.5 text-xs",
                                    lineMissingBatch(line, batchValidationOptions)
                                      ? "text-amber-700"
                                      : "text-brand-muted",
                                  )}
                                >
                                  {lineMissingBatch(line, batchValidationOptions)
                                    ? "Batch not recorded"
                                    : (line.batchNumber ?? "Batch selected")}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={line.quantity}
                              className="ml-auto h-9 w-24 text-right"
                              onFocus={() => editor.setActiveRowKey(line.key)}
                              onChange={(event) =>
                                editor.updateLine(line.key, { quantity: event.target.value })
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  editor.confirmRow(line.key, { addAnother: true });
                                }
                                if (event.key === "Escape" && line.isNew) {
                                  event.preventDefault();
                                  editor.discardNewLine(line.key);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm text-brand-slate">
                              {formatInventoryQuantity(line.quantity)}
                            </span>
                          )}
                        </td>
                        {batchTrackingEnabled ? (
                          <td className="px-3 py-3">
                            {line.product_id ? (
                              <PurchaseOrderLineBatchButton
                                isComplete={batchComplete}
                                data-testid={`internal-order-line-batch-button-${line.key}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBatchDialogLineKey(line.key);
                                }}
                              />
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-brand-border px-4 py-3">
              <SecondaryButton
                type="button"
                onClick={editor.addLine}
                data-testid="add-internal-order-line-item-button"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add line item
              </SecondaryButton>
            </div>
          </div>
        </>
      )}

      {batchTrackingEnabled ? (
        <InternalOrderLineBatchSelectDialog
          open={batchDialogLineKey !== null}
          onOpenChange={(open) => {
            if (!open) {
              setBatchDialogLineKey(null);
            }
          }}
          line={batchDialogLine}
          onSaved={async (patch) => {
            if (!batchDialogLineKey) {
              return;
            }

            await editor.saveLineBatch(batchDialogLineKey, patch);
          }}
        />
      ) : null}

      {editor.hasPendingChanges ? (
        <PurchaseOrderPendingChangesBar
          isSaving={editor.isSaving}
          onSave={() => void editor.saveChanges()}
          onDiscard={editor.discardChanges}
        />
      ) : null}
    </>
  );
}
