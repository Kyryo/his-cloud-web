"use client";

import { Maximize2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineNonPayableBadge } from "@/features/sales-orders/components/detail/LineNonPayableBadge";
import { SalesOrderLineProductPicker } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import type { SalesOrderLineProductSelection } from "@/features/sales-orders/components/detail/SalesOrderLineProductPicker";
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import { calculateSalesOrderLineDraftTotal } from "@/features/sales-orders/types/sales-order-line-draft";
import type { SalesOrder, SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { isSalesOrderLineNonPayable } from "@/features/sales-orders/utils/sales-order-line-payability";
import { cn } from "@/lib/utils";

const LINE_COLS =
  "sm:grid-cols-[minmax(0,1.4fr)_4.5rem_6.75rem_6.75rem_auto]";
const LINE_GRID = cn(
  "grid grid-cols-1 items-start gap-x-3 gap-y-2 sm:items-center",
  LINE_COLS,
);

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

function LineListHeader() {
  return (
    <div
      className={cn(
        "hidden border-b border-dash-border/70 pb-2 text-[11px] font-medium uppercase tracking-wide text-brand-muted sm:grid sm:items-center sm:gap-x-3",
        LINE_COLS,
      )}
    >
      <span>Item</span>
      <span className="text-right">Qty</span>
      <span className="text-right">Price</span>
      <span className="text-right">Total</span>
      <span className="sr-only">Actions</span>
    </div>
  );
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
      <LineListHeader />
      <ul className="divide-y divide-dash-border/60">{children}</ul>
      {footer ? <div className="pt-3">{footer}</div> : null}
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
        <li key={line.id} className={cn(LINE_GRID, "py-3")}>
          <div className="min-w-0">
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
          </div>
          <p className="text-sm tabular-nums text-brand-slate sm:text-right">
            <span className="mr-1 text-xs text-brand-muted sm:hidden">Qty</span>
            {formatQuantity(line.quantity)}
          </p>
          <p className="text-sm tabular-nums text-brand-slate sm:text-right">
            <span className="mr-1 text-xs text-brand-muted sm:hidden">Price</span>
            {formatSalesOrderAmount(line.price_unit)}
          </p>
          <p className="text-sm font-medium tabular-nums text-brand-navy sm:text-right">
            {formatSalesOrderAmount(line.price_total)}
          </p>
          <span className="hidden sm:block" />
        </li>
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
    <li
      className={cn(
        LINE_GRID,
        "group py-3",
        !isEditing && !line.isNew && "cursor-pointer",
        isActive && "sm:-mx-2 sm:rounded-md sm:px-2",
      )}
      onClick={() => {
        if (!line.isNew && !isEditing && !isSaving) {
          onEdit(line.key);
          onActivate(line.key);
        }
      }}
    >
      <div className="min-w-0">
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
      </div>

      {isEditing ? (
        <label className="block">
          <span className="mb-1 block text-xs text-brand-muted sm:sr-only">
            Qty
          </span>
          <Input
            type="number"
            min="0"
            step="any"
            value={line.quantity}
            disabled={isSaving}
            className="h-9 text-right"
            onFocus={() => onActivate(line.key)}
            onChange={(event) =>
              onUpdate(line.key, { quantity: event.target.value })
            }
          />
        </label>
      ) : (
        <p className="text-sm tabular-nums text-brand-slate sm:text-right">
          <span className="mr-1 text-xs text-brand-muted sm:hidden">Qty</span>
          {formatQuantity(line.quantity)}
        </p>
      )}

      {isEditing ? (
        <label className="block">
          <span className="mb-1 block text-xs text-brand-muted sm:sr-only">
            Price
          </span>
          <Input
            type="number"
            min="0"
            step="any"
            value={line.price_unit}
            disabled={isSaving}
            className="h-9 text-right"
            onFocus={() => onActivate(line.key)}
            onChange={(event) =>
              onUpdate(line.key, {
                price_unit: event.target.value,
                priceUnitOverridden: true,
              })
            }
            onBlur={() => onPriceBlur(line.key)}
          />
        </label>
      ) : (
        <p className="text-sm tabular-nums text-brand-slate sm:text-right">
          <span className="mr-1 text-xs text-brand-muted sm:hidden">Price</span>
          {formatSalesOrderAmount(line.price_unit)}
        </p>
      )}

      <p className="text-sm font-medium tabular-nums text-brand-navy sm:text-right">
        {formatSalesOrderAmount(lineTotal)}
      </p>

      <LineRowActions
        line={line}
        isSaving={isSaving}
        alwaysVisible={isEditing}
        onViewDetails={onViewDetails}
        onRemove={onRemove}
      />
    </li>
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
    <div className="flex justify-end gap-0.5 sm:justify-self-end">
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
