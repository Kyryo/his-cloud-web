"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PharmacyQueueDispenseStatusBadge } from "@/features/dispensation/components/PharmacyQueueDispenseStatusBadge";
import { PharmacyQueueLineProgress } from "@/features/dispensation/components/PharmacyQueueLineProgress";
import type {
  DispensationQueueDetail,
  DispensationQueueLine,
} from "@/features/dispensation/types/dispensation.types";
import {
  formatDispensationQuantity,
  getLineDispenseStatus,
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
      <p
        className="px-4 py-6 text-sm text-brand-muted sm:px-6"
        data-testid="pharmacy-queue-lines-empty"
      >
        No dispensable line items.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="pharmacy-queue-lines-tab">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-dash-border/80 bg-white">
            <th className="w-10 px-3 py-2 text-left sm:px-4">
              <input
                type="checkbox"
                aria-label="Select all line items"
                className="size-4 rounded border-brand-border accent-brand-primary text-brand-primary focus:ring-brand-primary"
                checked={allSelected}
                onChange={(event) =>
                  onSelectedLineUuidsChange(
                    event.target.checked
                      ? selectableLines.map((line) => line.uuid)
                      : [],
                  )
                }
              />
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted sm:px-4">
              Product
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted">
              Status
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted">
              Ordered
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted">
              Dispensed
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted">
              Remaining
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted sm:px-4">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dash-border/60">
          {detail.lines.map((line) => {
            const remaining = remainingQuantity(
              line.quantity,
              line.dispensed_quantity,
            );
            const done = isLineFullyDispensed(line);
            const status = getLineDispenseStatus(line);
            const ordered = Number(line.quantity) || 0;
            const dispensed = Number(line.dispensed_quantity) || 0;

            return (
              <tr
                key={line.uuid}
                className={cn("group", done && "bg-slate-50/40")}
              >
                <td className="px-3 py-2 sm:px-4">
                  <input
                    type="checkbox"
                    aria-label={`Select ${line.product_name}`}
                    className="size-4 rounded border-brand-border accent-brand-primary text-brand-primary focus:ring-brand-primary"
                    checked={!done && selectedLineUuids.includes(line.uuid)}
                    disabled={done}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedLineUuidsChange([
                          ...selectedLineUuids,
                          line.uuid,
                        ]);
                        return;
                      }
                      onSelectedLineUuidsChange(
                        selectedLineUuids.filter((uuid) => uuid !== line.uuid),
                      );
                    }}
                  />
                </td>
                <td className="px-3 py-2 sm:px-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {line.product_name}
                    </p>
                    <PharmacyQueueLineProgress
                      ordered={ordered}
                      dispensed={dispensed}
                      className="w-24"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <PharmacyQueueDispenseStatusBadge status={status} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-brand-navy">
                  {formatDispensationQuantity(line.quantity)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-brand-navy">
                  {formatDispensationQuantity(line.dispensed_quantity)}
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums text-brand-navy">
                  {formatDispensationQuantity(remaining)}
                </td>
                <td className="px-3 py-2 text-right sm:px-4">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-brand-muted opacity-0 transition-opacity hover:text-brand-navy group-hover:opacity-100 focus-visible:opacity-100"
                      disabled={!canManageLines}
                      title={
                        canManageLines
                          ? `Edit ${line.product_name}`
                          : "Only draft sales orders can edit line items."
                      }
                      aria-label={`Edit ${line.product_name}`}
                      onClick={() => onEdit(line)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-brand-muted opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100"
                      disabled={!canManageLines}
                      title={
                        canManageLines
                          ? `Delete ${line.product_name}`
                          : "Only draft sales orders can delete line items."
                      }
                      aria-label={`Delete ${line.product_name}`}
                      onClick={() => onDelete(line)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
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
