"use client";

import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineProductCombobox } from "@/features/inventory/components/detail/InlineProductCombobox";
import {
  fetchInventoryProductPricelists,
  fetchProductTariffCodes,
} from "@/features/inventory/services/inventory.service";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { SalesOrderPendingChangesBar } from "@/features/sales-orders/components/detail/SalesOrderPendingChangesBar";
import { useSalesOrderLinesEditor } from "@/features/sales-orders/hooks/use-sales-order-lines-editor";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  calculateSalesOrderLineDraftTotal,
  type SalesOrderLineDraft,
} from "@/features/sales-orders/types/sales-order-line-draft";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
} from "@/features/sales-orders/utils/format-sales-order";
import { canEditSalesOrderLines } from "@/features/sales-orders/utils/sales-order-status";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SalesOrderLinesEditorProps = {
  order: SalesOrder;
  isActive: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
};

function formatQuantity(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const quantity = Number(value);
  if (!Number.isFinite(quantity)) {
    return String(value);
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(quantity);
}

function formatTariffCode(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function isRowEditing(
  line: SalesOrderLineDraft,
  editingRowKey: string | null,
): boolean {
  return line.isNew === true || editingRowKey === line.key;
}

export function SalesOrderLinesEditor({
  order,
  isActive,
  onOrderUpdated,
}: SalesOrderLinesEditorProps) {
  const { toast } = useToast();
  const canEdit = canEditSalesOrderLines(order.state);
  const currency = formatSalesOrderCurrency(order);
  const selectionTokenByLineKeyRef = useRef<Map<string, number>>(new Map());

  const editor = useSalesOrderLinesEditor({
    order,
    canEdit,
    onOrderUpdated,
    onError: (message) => {
      toast({ variant: "error", title: "Could not update line items", description: message });
    },
  });

  if (!isActive) {
    return null;
  }

  if (!canEdit) {
    const lines = order.lines ?? [];

    if (lines.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-brand-navy">No line items</p>
          <p className="mt-2 text-sm text-brand-muted">
            This sales order does not have any line items.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-brand-border bg-slate-50/80">
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                  Code
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                  Unit price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-sm text-brand-navy">{line.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-brand-slate">
                    {formatTariffCode(line.tariff_code)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-brand-slate">
                    {formatQuantity(line.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-brand-slate">
                    {formatSalesOrderAmount(line.price_unit)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                    {formatSalesOrderAmount(line.price_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-brand-border bg-slate-50/80 font-semibold text-brand-navy">
                <td className="px-4 py-3 text-sm" colSpan={4}>
                  Order total
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {formatSalesOrderAmount(order.amount_total, currency)}
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
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-semibold text-brand-navy">Line items</h3>
        <p className="text-xs text-brand-muted">
          Edit line items inline, then save or discard your changes below.
        </p>
      </div>

      {!hasRows ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <ClipboardList
            className="mx-auto size-10 text-brand-muted/70"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-brand-navy">No items yet</p>
          <p className="mt-2 text-sm text-brand-muted">
            Click Add line item to get started.
          </p>
          <SecondaryButton
            type="button"
            className="mt-6"
            disabled={editor.isSaving}
            onClick={editor.addLine}
            data-testid="add-sales-order-line-item-button"
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
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                    Code
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Unit price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                    Total
                  </th>
                  <th className="w-20 px-2 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {editor.draftLines.map((line) => {
                  const isEditing = isRowEditing(line, editor.editingRowKey);
                  const isActiveRow =
                    editor.activeRowKey === line.key ||
                    editor.editingRowKey === line.key;
                  const lineTotal =
                    isEditing || line.isNew
                      ? calculateSalesOrderLineDraftTotal(line)
                      : Number(line.price_total ?? 0);

                  return (
                    <tr
                      key={line.key}
                      className={cn(
                        "group transition-colors",
                        isActiveRow && "bg-sky-50/80",
                      )}
                      onClick={() => {
                        if (!line.isNew && !isEditing && !editor.isSaving) {
                          editor.setEditingRowKey(line.key);
                          editor.setActiveRowKey(line.key);
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <InlineProductCombobox
                            id={`so-line-product-${line.key}`}
                            value={line.product_uuid ?? null}
                            displayLabel={line.productName}
                            autoFocus={line.isNew === true}
                            disabled={editor.isSaving}
                            onFocus={() => editor.setActiveRowKey(line.key)}
                            onSelect={(product) => {
                              const nextToken =
                                (selectionTokenByLineKeyRef.current.get(line.key) ?? 0) +
                                1;
                              selectionTokenByLineKeyRef.current.set(line.key, nextToken);

                              editor.updateLine(line.key, {
                                product_uuid: product.uuid,
                                product_id: product.id ?? null,
                                productName: formatProductLabel(product),
                                // Reset computed fields when switching products to avoid
                                // stale values carrying over unnoticed.
                                tariff_code: null,
                                price_unit:
                                  line.price_unit ||
                                  (product.list_price != null
                                    ? String(product.list_price)
                                    : ""),
                              });

                              void (async () => {
                                const isStillCurrentSelection = () =>
                                  selectionTokenByLineKeyRef.current.get(line.key) ===
                                  nextToken;

                                // Prefill unit price from the order's pricelist (if available).
                                if (order.pricelist_id) {
                                  try {
                                    const items = await fetchInventoryProductPricelists(
                                      product.uuid,
                                    );
                                    if (!isStillCurrentSelection()) {
                                      return;
                                    }
                                    // Legacy numeric pricelist_id cannot match UUID memberships yet.
                                    void items;
                                  } catch {
                                    // Best-effort prefill only.
                                  }
                                }

                                if (order.insurance_scheme_id) {
                                  try {
                                    const codes = await fetchProductTariffCodes(
                                      product.uuid,
                                    );
                                    if (!isStillCurrentSelection()) {
                                      return;
                                    }
                                    // Legacy insurance_scheme_id cannot match scheme_uuid yet.
                                    void codes;
                                  } catch {
                                    // Best-effort prefill only.
                                  }
                                }
                              })();
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                event.preventDefault();
                                if (line.isNew) {
                                  editor.discardNewLine(line.key);
                                } else {
                                  editor.setEditingRowKey(null);
                                  editor.setActiveRowKey(null);
                                }
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium text-brand-navy">
                            {line.productName ?? "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-brand-slate">
                          {formatTariffCode(line.tariff_code)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={line.quantity}
                            disabled={editor.isSaving}
                            className="ml-auto h-9 w-24 text-right"
                            onFocus={() => editor.setActiveRowKey(line.key)}
                            onChange={(event) =>
                              editor.updateLine(line.key, {
                                quantity: event.target.value,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                editor.confirmRow(line.key, {
                                  addAnother: line.isNew,
                                });
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                if (line.isNew) {
                                  editor.discardNewLine(line.key);
                                } else {
                                  editor.setEditingRowKey(null);
                                  editor.setActiveRowKey(null);
                                }
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm text-brand-slate">
                            {formatQuantity(line.quantity)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={line.price_unit}
                            disabled={editor.isSaving}
                            className="ml-auto h-9 w-28 text-right"
                            onFocus={() => editor.setActiveRowKey(line.key)}
                            onChange={(event) =>
                              editor.updateLine(line.key, {
                                price_unit: event.target.value,
                              })
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                editor.confirmRow(line.key, {
                                  addAnother: line.isNew,
                                });
                              }
                              if (event.key === "Escape" && line.isNew) {
                                event.preventDefault();
                                editor.discardNewLine(line.key);
                              }
                              if (event.key === "Escape" && !line.isNew) {
                                event.preventDefault();
                                editor.setEditingRowKey(null);
                                editor.setActiveRowKey(null);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm text-brand-slate">
                            {formatSalesOrderAmount(line.price_unit)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                        {formatSalesOrderAmount(lineTotal)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={editor.isSaving}
                            className="size-8 text-brand-muted opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                            aria-label={`Remove ${line.productName ?? "line item"}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              editor.removeLine(line.key);
                            }}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand-border bg-slate-50/80 font-semibold text-brand-navy">
                  <td className="px-4 py-3 text-sm" colSpan={4}>
                    Order total
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {formatSalesOrderAmount(order.amount_total, currency)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="border-t border-brand-border px-4 py-3">
            <SecondaryButton
              type="button"
              disabled={editor.isSaving}
              onClick={editor.addLine}
              data-testid="add-sales-order-line-item-button"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add line item
            </SecondaryButton>
          </div>
        </div>
      )}

      {editor.hasPendingChanges ? (
        <SalesOrderPendingChangesBar
          isSaving={editor.isSaving}
          onSave={() => void editor.saveChanges()}
          onDiscard={editor.discardChanges}
        />
      ) : null}
    </>
  );
}
