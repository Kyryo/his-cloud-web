"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderActions,
  ListPageHeaderMobileSearch,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type PaymentsPageHeaderProps = {
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onRecordPayment?: () => void;
  isRecordPaymentDisabled?: boolean;
  recordPaymentDisabledReason?: string;
};

export function PaymentsPageHeader({
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onRecordPayment,
  isRecordPaymentDisabled = false,
  recordPaymentDisabledReason,
}: PaymentsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Payments"
          description="Review customer payments recorded against invoices."
        />

        {onRecordPayment ? (
          <ListPageHeaderActions>
            <AddActionButton
              label="Record payment"
              showIcon={false}
              className="hidden shrink-0 self-start sm:inline-flex"
              disabled={isRecordPaymentDisabled}
              title={
                isRecordPaymentDisabled ? recordPaymentDisabledReason : undefined
              }
              onClick={onRecordPayment}
              data-testid="payments-record-payment-button"
            />
          </ListPageHeaderActions>
        ) : null}
      </ListPageHeaderTopRow>
      <ListPageHeaderMobileSearch>
        <Input
          id="payment-search-mobile"
          type="search"
          placeholder="Search by payment reference, client, invoice, or method..."
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
        <Button type="button" variant="outline" className="w-full" disabled={isSearchDisabled} onClick={onSearchSubmit}>
          Search
        </Button>
        {search ? (
          <Button type="button" variant="outline" className="w-full" disabled={isSearchDisabled} onClick={onClearSearch}>
            Clear
          </Button>
        ) : null}
        {onRecordPayment ? (
          <AddActionButton
            label="Record payment"
            showIcon={false}
            className="w-full sm:hidden"
            disabled={isRecordPaymentDisabled}
            title={
              isRecordPaymentDisabled ? recordPaymentDisabledReason : undefined
            }
            onClick={onRecordPayment}
            data-testid="payments-record-payment-button-mobile"
          />
        ) : null}
      </ListPageHeaderMobileSearch>
    </ListPageHeaderSection>
  );
}
