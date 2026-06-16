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
import {
  countActiveInvoiceFilters,
  DEFAULT_INVOICE_LIST_FILTERS,
  type InvoiceListFilterState,
} from "@/features/invoices/utils/invoice-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const INVOICE_STATE_OPTIONS = [
  { value: "all", label: "All states" },
  { value: "draft", label: "Draft" },
  { value: "posted", label: "Posted" },
  { value: "cancel", label: "Cancelled" },
] as const;

const INVOICE_PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All payment statuses" },
  { value: "not_paid", label: "Not paid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "overpaid", label: "Overpaid" },
] as const;

type InvoiceFiltersSheetProps = {
  filters: InvoiceListFilterState;
  isLoading?: boolean;
  onApply: (filters: InvoiceListFilterState) => void;
};

export function InvoiceFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: InvoiceFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(() => countActiveInvoiceFilters(filters), [filters]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => {
          setDraft(filters);
          setOpen(true);
        }}
        data-testid="invoices-filters-button"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className={cn("w-full sm:max-w-md", appFont.className)}>
          <SheetHeader>
            <SheetTitle>Filter invoices</SheetTitle>
            <SheetDescription>
              Narrow the list by state or invoice date.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSelectField
              id="invoice-filter-state"
              label="State"
              value={draft.state}
              options={INVOICE_STATE_OPTIONS}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  state: value as InvoiceListFilterState["state"],
                }))
              }
            />
            <FilterSelectField
              id="invoice-filter-payment-status"
              label="Payment status"
              value={draft.paymentStatus}
              options={INVOICE_PAYMENT_STATUS_OPTIONS}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  paymentStatus: value as InvoiceListFilterState["paymentStatus"],
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-navy" htmlFor="invoice-date-from">
                  Date from
                </label>
                <Input
                  id="invoice-date-from"
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
                <label className="text-sm font-medium text-brand-navy" htmlFor="invoice-date-to">
                  Date to
                </label>
                <Input
                  id="invoice-date-to"
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

          <SheetFooter className="mt-8 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(DEFAULT_INVOICE_LIST_FILTERS)}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => {
                onApply(draft);
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
