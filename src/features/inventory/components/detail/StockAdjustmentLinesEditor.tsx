"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PurchaseOrderPendingChangesBar } from "@/features/inventory/components/detail/PurchaseOrderPendingChangesBar";
import { ProductSearchSelect } from "@/features/inventory/components/ProductSearchSelect";
import { useStockAdjustmentLinesEditor } from "@/features/inventory/hooks/use-stock-adjustment-lines-editor";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  countSavedStockAdjustmentLineDrafts,
  countStockAdjustmentLinesWithValidationIssues,
  getStockAdjustmentLineValidationIssues,
  type StockAdjustmentLineDraft,
} from "@/features/inventory/types/stock-adjustment-line-draft";
import { formatInventoryQuantity } from "@/features/inventory/utils/format-inventory";
import { useEnterEscapeShortcuts } from "@/hooks/use-enter-escape-shortcuts";
import { cn } from "@/lib/utils";

type StockAdjustmentLinesEditorProps = {
  adjustment: StockAdjustment;
  canEdit: boolean;
  autoAddLine?: boolean;
  onUpdated: (adjustment: StockAdjustment) => void;
  onError: (message: string) => void;
  onStateChange?: (state: {
    lineCount: number;
    isDirty: boolean;
    draftLines: StockAdjustmentLineDraft[];
    validationIssueCount: number;
  }) => void;
};

function isRowEditing(
  line: StockAdjustmentLineDraft,
  editingRowKey: string | null,
): boolean {
  return line.isNew === true || editingRowKey === line.key;
}

export function StockAdjustmentLinesEditor({
  adjustment,
  canEdit,
  autoAddLine = false,
  onUpdated,
  onError,
  onStateChange,
}: StockAdjustmentLinesEditorProps) {
  const [highlightedLineKeys, setHighlightedLineKeys] = useState<Set<string>>(
    new Set(),
  );

  const editor = useStockAdjustmentLinesEditor({
    adjustment,
    canEdit,
    autoAddLine,
    onUpdated,
    onError,
  });

  useEnterEscapeShortcuts({
    enabled: canEdit && editor.hasPendingChanges,
    isBusy: editor.isSaving,
    ignoreWhenDialogOpen: true,
    onEnter: editor.saveChanges,
    onEscape: editor.discardChanges,
  });

  const isCostAdjustment = editor.adjustmentType === "COST";

  const lineCount = useMemo(
    () => countSavedStockAdjustmentLineDrafts(editor.draftLines),
    [editor.draftLines],
  );

  const validationIssueCount = useMemo(
    () =>
      countStockAdjustmentLinesWithValidationIssues(
        editor.draftLines,
        editor.adjustmentType,
      ),
    [editor.adjustmentType, editor.draftLines],
  );

  const handleReviewItems = useCallback(() => {
    const offendingKeys = editor.draftLines
      .filter(
        (line) =>
          getStockAdjustmentLineValidationIssues(line, editor.adjustmentType)
            .length > 0,
      )
      .map((line) => line.key);

    if (offendingKeys.length === 0) {
      return;
    }

    setHighlightedLineKeys(new Set(offendingKeys));
    document.getElementById(`sa-line-row-${offendingKeys[0]}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => setHighlightedLineKeys(new Set()), 2400);
  }, [editor.adjustmentType, editor.draftLines]);

  useEffect(() => {
    onStateChange?.({
      lineCount,
      isDirty: editor.isDirty,
      draftLines: editor.draftLines,
      validationIssueCount,
    });
  }, [
    editor.draftLines,
    editor.isDirty,
    lineCount,
    onStateChange,
    validationIssueCount,
  ]);

  if (!canEdit && adjustment.lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
        <ClipboardList
          className="mx-auto size-10 text-brand-muted/70"
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
        <p className="mt-2 text-sm text-brand-muted">
          This stock adjustment does not have any line items.
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
              <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                #
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                {isCostAdjustment ? "New unit cost" : "Qty delta"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {adjustment.lines.map((line, index) => (
              <tr key={line.id ?? `${line.product_id}-${index}`}>
                <td className="px-4 py-3 text-sm text-brand-muted">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                  {line.product_name?.trim() || "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm text-brand-slate">
                  {isCostAdjustment
                    ? formatInventoryQuantity(line.new_unit_cost ?? 0)
                    : formatInventoryQuantity(line.quantity_delta)}
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
      {validationIssueCount > 0 ? (
        <p className="mb-3 text-sm text-amber-700">
          {validationIssueCount} line item
          {validationIssueCount === 1 ? "" : "s"} need attention.{" "}
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={handleReviewItems}
          >
            Review items
          </button>
        </p>
      ) : null}

      {!hasRows ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <ClipboardList
            className="mx-auto size-10 text-brand-muted/70"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-brand-navy">
            No items yet
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            No items yet. Click Add line item to get started
          </p>
          <SecondaryButton
            type="button"
            className="mt-6"
            onClick={editor.addLine}
            data-testid="add-stock-adjustment-line-item-button"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add line item
          </SecondaryButton>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    {isCostAdjustment ? "New unit cost" : "Qty delta"}
                  </th>
                  <th className="w-12 px-2 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {editor.draftLines.map((line, index) => {
                  const isEditing = isRowEditing(line, editor.editingRowKey);
                  const isHighlighted = highlightedLineKeys.has(line.key);
                  const hasValidationIssue =
                    getStockAdjustmentLineValidationIssues(
                      line,
                      editor.adjustmentType,
                    ).length > 0;

                  return (
                    <tr
                      key={line.key}
                      id={`sa-line-row-${line.key}`}
                      className={cn(
                        "group transition-colors",
                        isHighlighted &&
                          "bg-amber-50 ring-2 ring-inset ring-amber-300",
                      )}
                      onClick={() => {
                        if (!isEditing) {
                          editor.setEditingRowKey(line.key);
                          editor.setActiveRowKey(line.key);
                        }
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-brand-muted">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <ProductSearchSelect
                            id={`sa-line-product-${line.key}`}
                            value={line.product_uuid ?? null}
                            displayLabel={line.productName}
                            autoOpen={line.isNew === true}
                            disabled={editor.isSaving}
                            onFocus={() => editor.setActiveRowKey(line.key)}
                            onSelect={(selection) => {
                              editor.updateLine(line.key, {
                                product_uuid: selection.product_uuid,
                                product_id: selection.product_id,
                                productName: selection.productName,
                              });
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium text-brand-navy">
                            {line.productName?.trim() || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="any"
                            value={
                              isCostAdjustment
                                ? line.new_unit_cost
                                : line.quantity_delta
                            }
                            className={cn(
                              "ml-auto h-9 w-28 text-right",
                              hasValidationIssue && "border-amber-500",
                            )}
                            onFocus={() => editor.setActiveRowKey(line.key)}
                            onChange={(event) =>
                              editor.updateLine(
                                line.key,
                                isCostAdjustment
                                  ? { new_unit_cost: event.target.value }
                                  : { quantity_delta: event.target.value },
                              )
                            }
                          />
                        ) : (
                          <span className="text-sm text-brand-slate">
                            {isCostAdjustment
                              ? formatInventoryQuantity(line.new_unit_cost)
                              : formatInventoryQuantity(line.quantity_delta)}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={editor.isSaving}
                          className="size-8 text-brand-muted opacity-0 transition-opacity hover:text-red-600 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                          aria-label={`Remove ${line.productName ?? "line item"}`}
                          data-testid={`remove-stock-adjustment-line-${line.key}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            editor.removeLine(line.key);
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </td>
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
              data-testid="add-stock-adjustment-line-item-button"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add line item
            </SecondaryButton>
          </div>
        </div>
      )}

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
