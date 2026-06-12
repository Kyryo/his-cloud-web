"use client";

import { ClipboardList, GripVertical, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { InlineProductCombobox } from "@/features/inventory/components/detail/InlineProductCombobox";
import { PurchaseOrderBatchTrackingNotice } from "@/features/inventory/components/detail/PurchaseOrderBatchTrackingNotice";
import { PurchaseOrderLineBatchButton } from "@/features/inventory/components/detail/PurchaseOrderLineBatchButton";
import { PurchaseOrderLineBatchDialog } from "@/features/inventory/components/detail/PurchaseOrderLineBatchDialog";
import { PurchaseOrderPendingChangesBar } from "@/features/inventory/components/detail/PurchaseOrderPendingChangesBar";
import { usePurchaseOrderLinesEditor } from "@/features/inventory/hooks/use-purchase-order-lines-editor";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  calculateDraftsTotal,
  calculateLineDraftTotal,
  countLinesWithValidationIssues,
  countSavedLineDrafts,
  getLineValidationIssues,
  lineMissingBatchOrExpiry,
  type PurchaseOrderLineDraft,
} from "@/features/inventory/types/purchase-order-line-draft";
import {
  formatDisplayDate,
  formatInventoryAmount,
  formatInventoryQuantity,
  formatProductLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type PurchaseOrderLinesEditorProps = {
  order: PurchaseOrder;
  canEdit: boolean;
  currency: string;
  batchTrackingEnabled?: boolean;
  autoAddLine?: boolean;
  onUpdated: (order: PurchaseOrder) => void;
  onError: (message: string) => void;
  onStateChange?: (state: {
    lineCount: number;
    totalValue: number;
    isDirty: boolean;
    draftLines: PurchaseOrderLineDraft[];
    validationIssueCount: number;
  }) => void;
};

function isRowEditing(
  line: PurchaseOrderLineDraft,
  editingRowKey: string | null,
): boolean {
  return line.isNew === true || editingRowKey === line.key;
}

export function PurchaseOrderLinesEditor({
  order,
  canEdit,
  currency,
  batchTrackingEnabled = false,
  autoAddLine = false,
  onUpdated,
  onError,
  onStateChange,
}: PurchaseOrderLinesEditorProps) {
  const batchValidationOptions = { batchTrackingEnabled };
  const [batchDialogLineKey, setBatchDialogLineKey] = useState<string | null>(null);
  const [highlightedLineKeys, setHighlightedLineKeys] = useState<Set<string>>(new Set());

  const editor = usePurchaseOrderLinesEditor({
    order,
    canEdit,
    autoAddLine,
    onUpdated,
    onError,
  });

  const batchDialogLine = useMemo(
    () => editor.draftLines.find((line) => line.key === batchDialogLineKey) ?? null,
    [batchDialogLineKey, editor.draftLines],
  );

  const totalValue = useMemo(
    () => calculateDraftsTotal(editor.draftLines),
    [editor.draftLines],
  );

  const lineCount = useMemo(
    () => countSavedLineDrafts(editor.draftLines),
    [editor.draftLines],
  );

  const validationIssueCount = useMemo(
    () => countLinesWithValidationIssues(editor.draftLines, batchValidationOptions),
    [batchValidationOptions, editor.draftLines],
  );

  const handleReviewItems = useCallback(() => {
    const offendingKeys = editor.draftLines
      .filter((line) => getLineValidationIssues(line, batchValidationOptions).length > 0)
      .map((line) => line.key);

    if (offendingKeys.length === 0) {
      return;
    }

    setHighlightedLineKeys(new Set(offendingKeys));
    const firstRow = document.getElementById(`po-line-row-${offendingKeys[0]}`);
    firstRow?.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      setHighlightedLineKeys(new Set());
    }, 2400);
  }, [batchValidationOptions, editor.draftLines]);

  useEffect(() => {
    onStateChange?.({
      lineCount,
      totalValue,
      isDirty: editor.isDirty,
      draftLines: editor.draftLines,
      validationIssueCount,
    });
  }, [
    editor.draftLines,
    editor.isDirty,
    lineCount,
    onStateChange,
    totalValue,
    validationIssueCount,
  ]);

  if (!canEdit && order.lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
        <ClipboardList
          className="mx-auto size-10 text-brand-muted/70"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
        <p className="mt-2 text-sm text-brand-muted">
          This purchase order does not have any line items.
        </p>
      </div>
    );
  }

  if (!canEdit) {
    return (
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
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                  Unit cost ({currency})
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                  Total ({currency})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {order.lines.map((line, index) => (
                <tr key={line.id ?? `${line.odoo_product_id}-${index}`}>
                  <td className="px-4 py-3 text-sm text-brand-muted">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-brand-navy">
                      {line.product_name ?? `Product #${line.odoo_product_id}`}
                    </div>
                    {batchTrackingEnabled ? (
                      <p className="mt-0.5 text-xs text-brand-muted">
                        {line.batch_number
                          ? `${line.batch_number} · Exp ${formatDisplayDate(line.expiry_date)}`
                          : "No batch recorded"}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-brand-slate">
                    {formatInventoryQuantity(line.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-brand-slate">
                    {formatInventoryAmount(line.unit_cost, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                    {formatInventoryAmount(line.total_cost, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-brand-border bg-slate-50/80 font-semibold text-brand-navy">
                <td className="px-4 py-3" colSpan={4} />
                <td className="px-4 py-3 text-right text-sm">
                  {formatInventoryAmount(order.total_value, currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  const hasRows = editor.draftLines.length > 0;

  return (
    <>
      {!hasRows ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <ClipboardList
            className="mx-auto size-10 text-brand-muted/70"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
          <p className="mt-2 text-sm text-brand-muted">
            No items yet — click Add line item to get started
          </p>
          <SecondaryButton
            type="button"
            className="mt-6"
            onClick={editor.addLine}
            data-testid="add-purchase-order-line-item-button"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add line item
          </SecondaryButton>
        </div>
      ) : (
        <>
          {batchTrackingEnabled ? (
            <PurchaseOrderBatchTrackingNotice
              orderUuid={order.uuid}
              lines={editor.draftLines}
              batchTrackingEnabled
              onReviewItems={handleReviewItems}
            />
          ) : null}

          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-brand-border bg-slate-50/80">
                    <th className="w-10 px-3 py-3 text-left text-sm font-medium text-brand-muted">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                      Unit cost ({currency})
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                      Total ({currency})
                    </th>
                    {batchTrackingEnabled ? (
                      <th className="px-3 py-3 text-left text-sm font-medium text-brand-muted">
                        Batch
                      </th>
                    ) : null}
                    <th className="w-10 px-2 py-3" aria-label="Reorder" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {editor.draftLines.map((line, index) => {
                    const isEditing = isRowEditing(line, editor.editingRowKey);
                    const isActive =
                      editor.activeRowKey === line.key || editor.editingRowKey === line.key;
                    const lineTotal = calculateLineDraftTotal(line);
                    const isHighlighted = highlightedLineKeys.has(line.key);
                    const batchComplete = Boolean(
                      line.odoo_product_id &&
                        !lineMissingBatchOrExpiry(line, batchValidationOptions),
                    );

                    return (
                      <tr
                        key={line.key}
                        id={`po-line-row-${line.key}`}
                        draggable={!isEditing}
                        className={cn(
                          "group transition-colors",
                          isActive && "bg-sky-50/80",
                          isHighlighted && "bg-amber-50 ring-2 ring-inset ring-amber-300",
                          editor.draggingKey === line.key && "opacity-60",
                        )}
                        onClick={() => {
                          if (!isEditing) {
                            editor.setEditingRowKey(line.key);
                            editor.setActiveRowKey(line.key);
                          }
                        }}
                        onDragStart={() => editor.setDraggingKey(line.key)}
                        onDragEnd={() => editor.setDraggingKey(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (editor.draggingKey) {
                            editor.reorderLines(editor.draggingKey, line.key);
                            editor.setDraggingKey(null);
                          }
                        }}
                      >
                        <td className="px-3 py-3 text-sm text-brand-muted">{index + 1}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <InlineProductCombobox
                              id={`po-line-product-${line.key}`}
                              value={line.odoo_product_id}
                              displayLabel={line.productName}
                              autoFocus={line.isNew === true}
                              onFocus={() => editor.setActiveRowKey(line.key)}
                              onSelect={(product) => {
                                editor.updateLine(line.key, {
                                  odoo_product_id: product.id,
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
                                {line.productName ?? `Product #${line.odoo_product_id ?? "?"}`}
                              </span>
                              {line.odoo_product_id && batchTrackingEnabled ? (
                                <p
                                  className={cn(
                                    "mt-0.5 text-xs",
                                    lineMissingBatchOrExpiry(line, batchValidationOptions)
                                      ? "text-amber-700"
                                      : "text-brand-muted",
                                  )}
                                >
                                  {lineMissingBatchOrExpiry(line, batchValidationOptions)
                                    ? "Batch and expiry not recorded"
                                    : `${line.batchNumber ?? "Batch"} · Exp ${formatDisplayDate(line.expiry_date)}`}
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
                              onBlur={() => editor.setActiveRowKey(line.key)}
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
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={line.unit_cost}
                              className="ml-auto h-9 w-28 text-right"
                              onFocus={() => editor.setActiveRowKey(line.key)}
                              onChange={(event) =>
                                editor.updateLine(line.key, { unit_cost: event.target.value })
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
                              {formatInventoryAmount(line.unit_cost, currency)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                          {formatInventoryAmount(lineTotal, currency)}
                        </td>
                        {batchTrackingEnabled ? (
                          <td className="px-3 py-3">
                            {line.odoo_product_id ? (
                              <PurchaseOrderLineBatchButton
                                isComplete={batchComplete}
                                data-testid={`purchase-order-line-batch-button-${line.key}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBatchDialogLineKey(line.key);
                                }}
                              />
                            ) : null}
                          </td>
                        ) : null}
                        <td className="px-2 py-3 text-brand-muted/70">
                          <button
                            type="button"
                            className={cn(
                              "cursor-grab rounded p-1 opacity-0 transition-opacity hover:bg-slate-100 active:cursor-grabbing group-hover:opacity-100",
                              isEditing && "pointer-events-none opacity-0",
                            )}
                            aria-label={`Reorder line ${index + 1}`}
                            onClick={(event) => event.stopPropagation()}
                            disabled={isEditing}
                          >
                            <GripVertical className="size-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-brand-border bg-slate-50/80 font-semibold text-brand-navy">
                    <td className="px-3 py-3" colSpan={4} />
                    <td className="px-4 py-3 text-right text-sm">
                      {formatInventoryAmount(totalValue, currency)}
                    </td>
                    <td colSpan={batchTrackingEnabled ? 2 : 1} />
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="border-t border-brand-border px-4 py-3">
              <SecondaryButton
                type="button"
                onClick={editor.addLine}
                data-testid="add-purchase-order-line-item-button"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add line item
              </SecondaryButton>
            </div>
          </div>
        </>
      )}

      {batchTrackingEnabled ? (
        <PurchaseOrderLineBatchDialog
          open={batchDialogLineKey !== null}
          onOpenChange={(open) => {
            if (!open) {
              setBatchDialogLineKey(null);
            }
          }}
          line={batchDialogLine}
          tenantId={order.tenant}
          vendorName={order.vendor_name}
          onSaved={async (patch) => {
            if (!batchDialogLineKey) {
              return;
            }

            await editor.saveLineBatchDetails(batchDialogLineKey, patch);
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
