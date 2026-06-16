"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterSelectField } from "@/components/filter-select-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SalesOrderListFilterState } from "@/features/sales-orders/utils/sales-order-list-filters";
import {
  countActiveSalesOrderFilters,
  DEFAULT_SALES_ORDER_LIST_FILTERS,
  SALES_ORDER_INVOICE_STATUS_OPTIONS,
  SALES_ORDER_STATE_OPTIONS,
} from "@/features/sales-orders/utils/sales-order-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type SalesOrderFiltersSheetProps = {
  filters: SalesOrderListFilterState;
  isLoading?: boolean;
  onApply: (filters: SalesOrderListFilterState) => void;
};

export function SalesOrderFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: SalesOrderFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(
    () => countActiveSalesOrderFilters(filters),
    [filters],
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(filters);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    setDraft(DEFAULT_SALES_ORDER_LIST_FILTERS);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => setOpen(true)}
        data-testid="sales-orders-filters-button"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-1 font-normal">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-md", appFont.className)}
        >
          <SheetHeader className="border-b border-brand-border px-6 py-5">
            <SheetTitle>Filter sales orders</SheetTitle>
            <SheetDescription>
              Narrow the list by order state, invoice status, or date range.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <FilterSelectField
              id="sales-order-filter-state"
              label="Order state"
              value={draft.state}
              options={[...SALES_ORDER_STATE_OPTIONS]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  state: value as SalesOrderListFilterState["state"],
                }))
              }
            />

            <FilterSelectField
              id="sales-order-filter-invoice-status"
              label="Invoice status"
              value={draft.invoiceStatus}
              options={[...SALES_ORDER_INVOICE_STATUS_OPTIONS]}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  invoiceStatus: value as SalesOrderListFilterState["invoiceStatus"],
                }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="sales-order-date-from"
                  className="text-sm font-medium text-brand-navy"
                >
                  From date
                </label>
                <Input
                  id="sales-order-date-from"
                  type="date"
                  value={draft.dateFrom}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      dateFrom: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="sales-order-date-to"
                  className="text-sm font-medium text-brand-navy"
                >
                  To date
                </label>
                <Input
                  id="sales-order-date-to"
                  type="date"
                  value={draft.dateTo}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      dateTo: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-0 border-t border-brand-border px-6 py-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" onClick={handleApply}>
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
