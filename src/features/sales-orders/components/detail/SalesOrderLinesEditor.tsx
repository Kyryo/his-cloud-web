"use client";

import { ClipboardList, Maximize2, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type MutableRefObject } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchInventoryProductPricelists,
  fetchProductTariffCodes,
} from "@/features/inventory/services/inventory.service";
import type {
  InventoryProductPricelistItem,
  ProductTariffCode,
} from "@/features/inventory/types/inventory.types";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import {
  SalesOrderLineProductPicker,
  type SalesOrderLineProductSelection,
} from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import { SalesOrderPendingChangesBar } from "@/features/sales-orders/components/detail/SalesOrderPendingChangesBar";
import { LinePricingBreakdownDialog } from "@/features/sales-orders/components/detail/LinePricingBreakdownDialog";
import { SalesOrderProviderSelector } from "@/features/sales-orders/components/detail/SalesOrderProviderSelector";
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
import {
  isSalesOrderLineNonPayable,
  orderHasPricelist,
  resolveInitialLineIsPayable,
} from "@/features/sales-orders/utils/sales-order-line-payability";
import { canEditSalesOrderLines } from "@/features/sales-orders/utils/sales-order-status";
import { useEnterEscapeShortcuts } from "@/hooks/use-enter-escape-shortcuts";
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

function findOrderPricelistMembership(
  order: SalesOrder,
  memberships: InventoryProductPricelistItem[],
): InventoryProductPricelistItem | undefined {
  if (order.pricelist_uuid) {
    const byUuid = memberships.find(
      (item) => item.pricelist_uuid === order.pricelist_uuid,
    );
    if (byUuid) {
      return byUuid;
    }
  }

  const pricelistName = order.pricelist_name?.trim();
  if (pricelistName) {
    return memberships.find(
      (item) => item.pricelist_name?.trim() === pricelistName,
    );
  }

  return undefined;
}

function handleSalesOrderLineProductSelect(
  lineKey: string,
  selection: SalesOrderLineProductSelection,
  options: {
    order: SalesOrder;
    selectionTokenByLineKeyRef: MutableRefObject<Map<string, number>>;
    updateLine: (
      key: string,
      patch: Partial<SalesOrderLineDraft>,
    ) => void;
  },
) {
  const { order, selectionTokenByLineKeyRef, updateLine } = options;
  const nextToken = (selectionTokenByLineKeyRef.current.get(lineKey) ?? 0) + 1;
  selectionTokenByLineKeyRef.current.set(lineKey, nextToken);

  const pricePatch = (() => {
    const fixedPrice = selection.fixed_price?.trim();
    if (fixedPrice) {
      return { price_unit: fixedPrice, priceUnitOverridden: false };
    }

    const listPrice = selection.list_price;
    if (listPrice != null && listPrice !== "") {
      return {
        price_unit: String(listPrice),
        priceUnitOverridden: false,
      };
    }

    return { price_unit: "", priceUnitOverridden: false };
  })();

  const initialIsPayable = resolveInitialLineIsPayable(
    order,
    Boolean(selection.fixed_price?.trim()),
  );

  updateLine(lineKey, {
    product_uuid: selection.product_uuid,
    product_id: selection.product_id,
    productName: selection.productName,
    tariff_code: null,
    ...(initialIsPayable !== undefined ? { is_payable: initialIsPayable } : {}),
    ...pricePatch,
  });

  void (async () => {
    const isStillCurrentSelection = () =>
      selectionTokenByLineKeyRef.current.get(lineKey) === nextToken;

    const needsPricelistPrice =
      orderHasPricelist(order) && !selection.fixed_price?.trim();

    try {
      if (needsPricelistPrice) {
        const memberships = await fetchInventoryProductPricelists(
          selection.product_uuid,
        );
        if (!isStillCurrentSelection()) {
          return;
        }

        const membership = findOrderPricelistMembership(order, memberships);
        const fixedPrice =
          membership?.fixed_price != null
            ? String(membership.fixed_price).trim()
            : "";
        updateLine(lineKey, {
          ...(fixedPrice
            ? {
                price_unit: fixedPrice,
                priceUnitOverridden: false,
                is_payable: true,
              }
            : { is_payable: false }),
        });
      }

      if (!order.insurance_scheme_uuid) {
        return;
      }

      const codes = await fetchProductTariffCodes(selection.product_uuid);
      if (!isStillCurrentSelection()) {
        return;
      }

      const match = codes.find(
        (code: ProductTariffCode) => code.scheme_uuid === order.insurance_scheme_uuid,
      );
      if (match?.tariff_code) {
        updateLine(lineKey, { tariff_code: match.tariff_code });
      }
    } catch {
      // Best-effort prefill only.
    }
  })();
}

function isRowEditing(
  line: SalesOrderLineDraft,
  editingRowKey: string | null,
): boolean {
  return line.isNew === true || editingRowKey === line.key;
}

function SalesOrderLinesHeader({
  order,
  canEdit,
  onOrderUpdated,
  description,
}: {
  order: SalesOrder;
  canEdit: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
  description: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-brand-navy">Line items</h3>
        <p className="text-xs text-brand-muted">{description}</p>
      </div>
      <SalesOrderProviderSelector
        order={order}
        canEdit={canEdit}
        onOrderUpdated={onOrderUpdated}
        className="shrink-0"
      />
    </div>
  );
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
  const [breakdownLineId, setBreakdownLineId] = useState<number | null>(null);

  const editor = useSalesOrderLinesEditor({
    order,
    canEdit,
    onOrderUpdated,
    onError: (message) => {
      toast({ variant: "error", title: "Could not update line items", description: message });
    },
  });

  useEnterEscapeShortcuts({
    enabled: isActive && canEdit && editor.hasPendingChanges,
    isBusy: editor.isSaving,
    ignoreWhenDialogOpen: true,
    onEnter: editor.saveChanges,
    onEscape: editor.discardChanges,
  });

  const breakdownLine =
    order.lines?.find((line) => line.id === breakdownLineId) ?? null;

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
      <>
        <SalesOrderLinesHeader
          order={order}
          canEdit={false}
          onOrderUpdated={onOrderUpdated}
          description="Line items on this sales order."
        />
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
                  <td className="px-4 py-3 text-sm text-brand-navy">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>{line.name}</span>
                      {isSalesOrderLineNonPayable(order, line) ? (
                        <LineNonPayableBadge />
                      ) : null}
                    </div>
                  </td>
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
      </>
    );
  }

  const hasRows = editor.draftLines.length > 0;

  return (
    <>
      <SalesOrderLinesHeader
        order={order}
        canEdit={canEdit}
        onOrderUpdated={onOrderUpdated}
        description="Edit line items inline, then save or discard your changes below."
      />

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
                  <th className="w-24 px-2 py-3">
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isEditing ? (
                            <SalesOrderLineProductPicker
                              id={`so-line-product-${line.key}`}
                              value={line.product_uuid ?? null}
                              displayLabel={line.productName}
                              pricelistUuid={order.pricelist_uuid}
                              autoOpen={line.isNew === true}
                              disabled={editor.isSaving}
                              onFocus={() => editor.setActiveRowKey(line.key)}
                              onSelect={(selection) => {
                                handleSalesOrderLineProductSelect(line.key, selection, {
                                  order,
                                  selectionTokenByLineKeyRef,
                                  updateLine: editor.updateLine,
                                });
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-brand-navy">
                              {line.productName ?? "—"}
                            </span>
                          )}
                          {isSalesOrderLineNonPayable(order, line) ? (
                            <LineNonPayableBadge />
                          ) : null}
                        </div>
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
                                priceUnitOverridden: true,
                              })
                            }
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
                        <div className="flex justify-end gap-0.5">
                          {line.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={editor.isSaving}
                              className="size-8 text-brand-muted opacity-0 transition-opacity hover:text-brand-navy group-hover:opacity-100"
                              aria-label={`View details for ${line.productName ?? "line item"}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setBreakdownLineId(line.id ?? null);
                              }}
                            >
                              <Maximize2 className="size-4" aria-hidden="true" />
                            </Button>
                          ) : null}
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

      <LinePricingBreakdownDialog
        line={breakdownLine}
        capturedAt={order.date_order}
        open={breakdownLineId != null}
        onOpenChange={(open) => {
          if (!open) {
            setBreakdownLineId(null);
          }
        }}
      />
    </>
  );
}
