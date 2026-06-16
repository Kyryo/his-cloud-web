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
  countActivePaymentFilters,
  DEFAULT_PAYMENT_LIST_FILTERS,
  type PaymentListFilterState,
} from "@/features/payments/utils/payment-list-filters";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const PAYMENT_STATE_OPTIONS = [
  { value: "all", label: "All states" },
  { value: "draft", label: "Draft" },
  { value: "posted", label: "Posted" },
  { value: "cancel", label: "Cancelled" },
] as const;

type PaymentFiltersSheetProps = {
  filters: PaymentListFilterState;
  isLoading?: boolean;
  onApply: (filters: PaymentListFilterState) => void;
};

export function PaymentFiltersSheet({
  filters,
  isLoading = false,
  onApply,
}: PaymentFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const activeCount = useMemo(() => countActivePaymentFilters(filters), [filters]);

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
        data-testid="payments-filters-button"
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
            <SheetTitle>Filter payments</SheetTitle>
            <SheetDescription>
              Narrow the list by state or payment date.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterSelectField
              label="State"
              value={draft.state}
              options={PAYMENT_STATE_OPTIONS}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  state: value as PaymentListFilterState["state"],
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-navy" htmlFor="payment-date-from">
                  Date from
                </label>
                <Input
                  id="payment-date-from"
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
                <label className="text-sm font-medium text-brand-navy" htmlFor="payment-date-to">
                  Date to
                </label>
                <Input
                  id="payment-date-to"
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
              onClick={() => setDraft(DEFAULT_PAYMENT_LIST_FILTERS)}
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
