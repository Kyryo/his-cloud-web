"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import type {
  DispensationQueueDetail,
  DispensationQueueLine,
} from "@/features/dispensation/types/dispensation.types";
import {
  formatDispensationQuantity,
  isLineFullyDispensed,
  remainingQuantity,
} from "@/features/dispensation/utils/dispensation-qty";
import { cn } from "@/lib/utils";

type PharmacyQueueLineItemsTabProps = {
  detail: DispensationQueueDetail;
  isActive: boolean;
  selectedLineUuids: string[];
  onSelectedLineUuidsChange: (lineUuids: string[]) => void;
  canManageLines: boolean;
  onEdit: (line: DispensationQueueLine) => void;
  onDelete: (line: DispensationQueueLine) => void;
};

export function PharmacyQueueLineItemsTab({
  detail,
  isActive,
  selectedLineUuids,
  onSelectedLineUuidsChange,
  canManageLines,
  onEdit,
  onDelete,
}: PharmacyQueueLineItemsTabProps) {
  if (!isActive) {
    return null;
  }

  const selectableLines = detail.lines.filter(
    (line) => !isLineFullyDispensed(line),
  );
  const allSelected =
    selectableLines.length > 0 &&
    selectableLines.every((line) => selectedLineUuids.includes(line.uuid));

  if (detail.lines.length === 0) {
    return (
      <SalesOrderLinkedDetailsTable
        rows={[{ label: "Line items", value: "No dispensable line items." }]}
        data-testid="pharmacy-queue-lines-empty"
      />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-brand-border bg-white"
      data-testid="pharmacy-queue-lines-tab"
    >
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-brand-border bg-slate-50/80">
            <th className="w-12 px-4 py-3 text-left">
              <input
                type="checkbox"
                aria-label="Select all line items"
                className="size-4 rounded border-brand-border accent-brand-primary text-brand-primary focus:ring-brand-primary"
                checked={allSelected}
                onChange={(event) =>
                  onSelectedLineUuidsChange(
                    event.target.checked ? selectableLines.map((line) => line.uuid) : [],
                  )
                }
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
              Product
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
              Ordered
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
              Dispensed
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
              Remaining
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {detail.lines.map((line) => {
            const remaining = remainingQuantity(
              line.quantity,
              line.dispensed_quantity,
            );
            const done = isLineFullyDispensed(line);

            return (
              <tr
                key={line.uuid}
                className={cn(
                  "group",
                  done && "bg-slate-50/60 text-brand-muted",
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${line.product_name}`}
                    className="size-4 rounded border-brand-border accent-brand-primary text-brand-primary focus:ring-brand-primary"
                    checked={!done && selectedLineUuids.includes(line.uuid)}
                    disabled={done}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedLineUuidsChange([...selectedLineUuids, line.uuid]);
                        return;
                      }
                      onSelectedLineUuidsChange(
                        selectedLineUuids.filter((uuid) => uuid !== line.uuid),
                      );
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-brand-navy">
                  {line.product_name}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {formatDispensationQuantity(line.quantity)}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {formatDispensationQuantity(line.dispensed_quantity)}
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {formatDispensationQuantity(remaining)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-brand-muted opacity-0 transition-opacity hover:text-brand-navy group-hover:opacity-100 focus-visible:opacity-100"
                      disabled={!canManageLines}
                      title={
                        canManageLines
                          ? `Edit ${line.product_name}`
                          : "Only draft sales orders can edit line items."
                      }
                      aria-label={`Edit ${line.product_name}`}
                      onClick={() => onEdit(line)}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-brand-muted opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100"
                      disabled={!canManageLines}
                      title={
                        canManageLines
                          ? `Delete ${line.product_name}`
                          : "Only draft sales orders can delete line items."
                      }
                      aria-label={`Delete ${line.product_name}`}
                      onClick={() => onDelete(line)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
