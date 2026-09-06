"use client";

import { Maximize2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import { SalesOrderLineProductPicker } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import type { SalesOrderLineProductSelection } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import { calculateSalesOrderLineDraftTotal } from "@/features/sales-orders/types/sales-order-line-draft";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { isSalesOrderLineNonPayable } from "@/features/sales-orders/utils/sales-order-line-payability";
import { cn } from "@/lib/utils";

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

function LineListShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div data-testid="sales-order-lines-list">
      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            <ListPageDataTableHeaderCell>Item</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Qty
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Price
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="text-right">
              Total
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="w-20 pr-4">
              <span className="sr-only">Actions</span>
            </ListPageDataTableHeaderCell>
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>{children}</ListPageDataTableBody>
        {footer ? (
          <tfoot>
            <tr>
              <td colSpan={5} className="px-4 py-3">
                {footer}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </ListPageDataTable>
    </div>
  );
}

export function SalesOrderReadOnlyLineList({
  order,
  onNonPayableClick,
}: {
  order: SalesOrder;
  onNonPayableClick?: (lineId: number) => void;
}) {
  const lines = order.lines ?? [];

  return (
    <LineListShell>
      {lines.map((line) => (
        <ListPageDataTableRow key={line.id}>
          <ListPageDataTableCell className="py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium text-brand-navy">{line.name}</p>
              {isSalesOrderLineNonPayable(order, line) ? (
                <LineNonPayableBadge
                  onClick={
                    line.id != null
                      ? () => onNonPayableClick?.(line.id)
                      : undefined
                  }
                />
              ) : null}
            </div>
            <p className="mt-0.5 font-mono text-xs text-brand-muted">
              {formatTariffCode(line.tariff_code)}
            </p>
          </ListPageDataTableCell>
          <ListPageDataTableCell className="py-3 text-right tabular-nums">
            {formatQuantity(line.quantity)}
          </ListPageDataTableCell>
          <ListPageDataTableCell className="py-3 text-right tabular-nums">
            {formatSalesOrderAmount(line.price_unit)}
          </ListPageDataTableCell>
          <ListPageDataTableCell className="py-3 text-right font-medium tabular-nums text-brand-navy">
            {formatSalesOrderAmount(line.price_total)}
          </ListPageDataTableCell>
          <ListPageDataTableCell className="py-3 pr-4" />
        </ListPageDataTableRow>
      ))}
    </LineListShell>
  );
}

type SalesOrderEditableLineListProps = {
  order: SalesOrder;
  lines: SalesOrderLineDraft[];
  editingRowKey: string | null;
  activeRowKey: string | null;
  isSaving: boolean;
  footerAction?: ReactNode;
  onEdit: (key: string) => void;
  onActivate: (key: string) => void;
  onUpdate: (key: string, patch: Partial<SalesOrderLineDraft>) => void;
  onSelectProduct: (
    key: string,
    selection: SalesOrderLineProductSelection,
  ) => void;
  onRemove: (key: string) => void;
  onViewDetails: (lineId: number) => void;
  onNonPayableClick?: (lineId: number) => void;
  onPriceBlur: (key: string) => void;
};

export function SalesOrderEditableLineList({
  order,
  lines,
  editingRowKey,
  activeRowKey,
  isSaving,
  footerAction,
  onEdit,
  onActivate,
  onUpdate,
  onSelectProduct,
  onRemove,
  onViewDetails,
  onNonPayableClick,
  onPriceBlur,
}: SalesOrderEditableLineListProps) {
  return (
    <LineListShell footer={footerAction}>
      {lines.map((line) => {
        const isEditing = line.isNew === true || editingRowKey === line.key;
        const isActive = activeRowKey === line.key || editingRowKey === line.key;
        const lineTotal =
          isEditing || line.isNew
            ? calculateSalesOrderLineDraftTotal(line)
            : Number(line.price_total ?? 0);

        return (
          <EditableLineRow
            key={line.key}
            order={order}
            line={line}
            isEditing={isEditing}
            isActive={isActive}
            isSaving={isSaving}
            lineTotal={lineTotal}
            onEdit={onEdit}
            onActivate={onActivate}
            onUpdate={onUpdate}
            onSelectProduct={onSelectProduct}
            onRemove={onRemove}
            onViewDetails={onViewDetails}
            onNonPayableClick={onNonPayableClick}
            onPriceBlur={onPriceBlur}
          />
        );
      })}
    </LineListShell>
  );
}

function EditableLineRow({
  order,
  line,
  isEditing,
  isActive,
  isSaving,
  lineTotal,
  onEdit,
  onActivate,
  onUpdate,
  onSelectProduct,
  onRemove,
  onViewDetails,
  onNonPayableClick,
  onPriceBlur,
}: {
  order: SalesOrder;
  line: SalesOrderLineDraft;
  isEditing: boolean;
  isActive: boolean;
  isSaving: boolean;
  lineTotal: number;
  onEdit: (key: string) => void;
  onActivate: (key: string) => void;
  onUpdate: (key: string, patch: Partial<SalesOrderLineDraft>) => void;
  onSelectProduct: (
    key: string,
    selection: SalesOrderLineProductSelection,
  ) => void;
  onRemove: (key: string) => void;
  onViewDetails: (lineId: number) => void;
  onNonPayableClick?: (lineId: number) => void;
  onPriceBlur: (key: string) => void;
}) {
  return (
    <ListPageDataTableRow
      className={cn(
        "group",
        !isEditing && !line.isNew && "cursor-pointer",
        isActive && "bg-dash-panel/60",
      )}
      onClick={() => {
        if (!line.isNew && !isEditing && !isSaving) {
          onEdit(line.key);
          onActivate(line.key);
        }
      }}
    >
      <ListPageDataTableCell className="py-3">
        {isEditing ? (
          <SalesOrderLineProductPicker
            id={`so-line-product-${line.key}`}
            value={line.product_uuid ?? null}
            displayLabel={line.productName}
            autoOpen={line.isNew === true}
            disabled={isSaving}
            onFocus={() => onActivate(line.key)}
            onSelect={(selection) => onSelectProduct(line.key, selection)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium text-brand-navy">
                {line.productName ?? "—"}
              </p>
              {isSalesOrderLineNonPayable(order, line) ? (
                <LineNonPayableBadge
                  onClick={
                    line.id != null
                      ? () => onNonPayableClick?.(line.id as number)
                      : undefined
                  }
                />
              ) : null}
            </div>
            <p className="mt-0.5 font-mono text-xs text-brand-muted">
              {formatTariffCode(line.tariff_code)}
            </p>
          </>
        )}
      </ListPageDataTableCell>

      <ListPageDataTableCell className="py-3">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            step="any"
            value={line.quantity}
            disabled={isSaving}
            aria-label="Qty"
            className="ml-auto h-9 w-20 text-right"
            onFocus={() => onActivate(line.key)}
            onChange={(event) =>
              onUpdate(line.key, { quantity: event.target.value })
            }
          />
        ) : (
          <p className="text-right tabular-nums">{formatQuantity(line.quantity)}</p>
        )}
      </ListPageDataTableCell>

      <ListPageDataTableCell className="py-3">
        {isEditing ? (
          <Input
            type="number"
            min="0"
            step="any"
            value={line.price_unit}
            disabled={isSaving}
            aria-label="Price"
            className="ml-auto h-9 w-28 text-right"
            onFocus={() => onActivate(line.key)}
            onChange={(event) =>
              onUpdate(line.key, {
                price_unit: event.target.value,
                priceUnitOverridden: true,
              })
            }
            onBlur={() => onPriceBlur(line.key)}
          />
        ) : (
          <p className="text-right tabular-nums">
            {formatSalesOrderAmount(line.price_unit)}
          </p>
        )}
      </ListPageDataTableCell>

      <ListPageDataTableCell className="py-3 text-right font-medium tabular-nums text-brand-navy">
        {formatSalesOrderAmount(lineTotal)}
      </ListPageDataTableCell>

      <ListPageDataTableCell className="py-3 pr-4">
        <LineRowActions
          line={line}
          isSaving={isSaving}
          alwaysVisible={isEditing}
          onViewDetails={onViewDetails}
          onRemove={onRemove}
        />
      </ListPageDataTableCell>
    </ListPageDataTableRow>
  );
}

function LineRowActions({
  line,
  isSaving,
  alwaysVisible = false,
  onViewDetails,
  onRemove,
}: {
  line: SalesOrderLineDraft;
  isSaving: boolean;
  alwaysVisible?: boolean;
  onViewDetails: (lineId: number) => void;
  onRemove: (key: string) => void;
}) {
  return (
    <div className="flex justify-end gap-0.5">
      {line.id ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSaving}
          className={cn(
            "size-8 text-brand-muted hover:text-brand-navy",
            !alwaysVisible &&
              "sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100",
          )}
          aria-label={`View details for ${line.productName ?? "line item"}`}
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails(line.id as number);
          }}
        >
          <Maximize2 className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isSaving}
        className={cn(
          "size-8 text-brand-muted hover:text-red-600",
          !alwaysVisible &&
            "sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100",
        )}
        aria-label={`Remove ${line.productName ?? "line item"}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove(line.key);
        }}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
