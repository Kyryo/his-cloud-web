"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type PaymentsPageHeaderProps = {
  onRecordPayment?: () => void;
  isRecordPaymentDisabled?: boolean;
  recordPaymentDisabledReason?: string;
};

export function PaymentsPageHeader({
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
    </ListPageHeaderSection>
  );
}
