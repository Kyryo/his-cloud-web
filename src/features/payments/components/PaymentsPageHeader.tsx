"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { PaymentListToolbar } from "@/features/payments/components/PaymentListToolbar";
import type { PaymentListFilterState } from "@/features/payments/utils/payment-list-filters";

type PaymentsPageHeaderProps = {
  search: string;
  filters: PaymentListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: PaymentListFilterState) => void;
  onRecordPayment: () => void;
};

export function PaymentsPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onRecordPayment,
}: PaymentsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <PaymentListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            onClick={onRecordPayment}
            data-testid="payments-record-payment-button"
          >
            <AppIcon name="add" className="size-3.5" />
            <span>Record Payment</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
