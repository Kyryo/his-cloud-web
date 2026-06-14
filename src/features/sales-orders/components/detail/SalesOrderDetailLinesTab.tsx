"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddSalesOrderLineDialog } from "@/features/sales-orders/components/detail/AddSalesOrderLineDialog";
import {
  removeSalesOrderLine,
  updateSalesOrderLinePrice,
} from "@/features/sales-orders/services/sales-orders.service";
import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderAmount,
  formatSalesOrderCurrency,
} from "@/features/sales-orders/utils/format-sales-order";
import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";
import { canEditSalesOrderLines } from "@/features/sales-orders/utils/sales-order-status";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SalesOrderDetailLinesTabProps = {
  order: SalesOrder;
  isActive: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
};

type PendingPriceEdit = {
  line: SalesOrderLine;
  value: string;
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

export function SalesOrderDetailLinesTab({
  order,
  isActive,
  onOrderUpdated,
}: SalesOrderDetailLinesTabProps) {
  const { toast } = useToast();
  const canEdit = canEditSalesOrderLines(order.state);
  const currency = formatSalesOrderCurrency(order);
  const lines = order.order_lines ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const [priceEdit, setPriceEdit] = useState<PendingPriceEdit | null>(null);
  const [pendingRemove, setPendingRemove] = useState<SalesOrderLine | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleUpdatePrice() {
    if (!priceEdit) {
      return;
    }

    const parsedPrice = Number(priceEdit.value);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast({
        variant: "error",
        title: "Invalid unit price",
        description: "Enter a unit price of zero or greater.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedOrder = await updateSalesOrderLinePrice(
        order.id,
        priceEdit.line.id,
        { price_unit: parsedPrice.toFixed(4) },
      );
      toast({
        variant: "success",
        title: "Unit price updated",
        description: "The line item price was saved.",
      });
      setPriceEdit(null);
      onOrderUpdated(updatedOrder);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update price",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    if (!pendingRemove) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedOrder = await removeSalesOrderLine(order.id, pendingRemove.id);
      toast({
        variant: "success",
        title: "Line item removed",
        description: "The sales order was updated.",
      });
      setPendingRemove(null);
      onOrderUpdated(updatedOrder);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not remove line item",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-navy">Line items</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            {canEdit
              ? "Add, update prices, or remove items while this order is editable."
              : "This order is locked and line items can no longer be changed."}
          </p>
        </div>
        {canEdit ? (
          <PrimaryButton
            type="button"
            className="rounded-full"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add line item
          </PrimaryButton>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-brand-navy">No line items</p>
          <p className="mt-2 text-sm text-brand-muted">
            {canEdit
              ? "Add products to build this sales order."
              : "This sales order does not have any line items."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-brand-border bg-white",
          )}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border bg-slate-50/80">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
                  >
                    Unit price
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
                  >
                    Total
                  </th>
                  {canEdit ? (
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-sm font-medium text-brand-muted"
                    >
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {lines.map((line: SalesOrderLine) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-sm text-brand-navy">{line.name}</td>
                    <td className="px-4 py-3 text-sm text-brand-slate">
                      {formatOdooRelation(line.product_id)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {formatQuantity(line.product_uom_qty)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {formatSalesOrderAmount(line.price_unit, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-brand-slate">
                      {formatSalesOrderAmount(line.price_subtotal, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-brand-navy">
                      {formatSalesOrderAmount(line.price_total, currency)}
                    </td>
                    {canEdit ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            type="button"
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              setPriceEdit({
                                line,
                                value:
                                  line.price_unit != null
                                    ? String(line.price_unit)
                                    : "",
                              })
                            }
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit price
                          </SecondaryButton>
                          <SecondaryButton
                            type="button"
                            size="sm"
                            className="rounded-full text-red-600 hover:text-red-700"
                            onClick={() => setPendingRemove(line)}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Remove
                          </SecondaryButton>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddSalesOrderLineDialog
        order={order}
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={onOrderUpdated}
      />

      <Dialog
        open={Boolean(priceEdit)}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setPriceEdit(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Update unit price</DialogTitle>
            <DialogDescription>
              {priceEdit?.line.name
                ? `Set the unit price for ${priceEdit.line.name}.`
                : "Set the unit price for this line item."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="sales-order-line-edit-price">Unit price</Label>
            <Input
              id="sales-order-line-edit-price"
              type="number"
              min="0"
              step="any"
              value={priceEdit?.value ?? ""}
              disabled={isSaving}
              onChange={(event) =>
                setPriceEdit((current) =>
                  current ? { ...current, value: event.target.value } : current,
                )
              }
            />
          </div>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setPriceEdit(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isSaving}
              onClick={() => void handleUpdatePrice()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save price"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setPendingRemove(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Remove line item?</DialogTitle>
            <DialogDescription>
              {pendingRemove?.name
                ? `Remove ${pendingRemove.name} from this sales order.`
                : "Remove this line item from the sales order."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setPendingRemove(null)}
            >
              Keep line item
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isSaving}
              onClick={() => void handleRemove()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Removing...
                </>
              ) : (
                "Remove line item"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
