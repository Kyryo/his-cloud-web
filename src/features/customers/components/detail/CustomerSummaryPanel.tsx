"use client";

import { Button } from "@/components/ui/button";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import {
  ERP_SYNC_LABELS,
  formatErpSyncStatus,
} from "@/features/customers/constants/customer-sync-labels";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";

type CustomerSummaryPanelProps = {
  customer: Customer;
  onUpdateClick: () => void;
  className?: string;
};

export function CustomerSummaryPanel({
  customer,
  onUpdateClick,
  className,
}: CustomerSummaryPanelProps) {
  const fullName = formatCustomerName(customer);
  const ageDisplay = formatAdaptiveAge(customer.dob);

  return (
    <DetailPageAsidePanelSection className={className}>
      <DetailPageAsidePanelHeader
        title="Client Summary"
        description="Client profile and sync details"
      />

      <DetailPageAsideSummarySection
        title="Personal"
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
            onClick={onUpdateClick}
            data-testid="update-customer-button"
          >
            Edit details
          </Button>
        }
      >
        <DetailPageAsideSummaryField label="Name" value={fullName} />
        <DetailPageAsideSummaryField
          label="Client ID"
          value={customer.customer_identifier}
        />
        <DetailPageAsideSummaryField
          label="Phone"
          value={customer.phone_number ?? "—"}
        />
        <DetailPageAsideSummaryField label="Email" value={customer.email ?? "—"} />
        <DetailPageAsideSummaryField label="Gender" value={customer.gender} />
        <DetailPageAsideSummaryField
          label="Date of Birth"
          value={
            <>
              {formatDisplayDate(customer.dob)}
              {customer.dob_is_estimated ? (
                <span className="ml-1 text-xs text-brand-muted">(estimated)</span>
              ) : null}
            </>
          }
        />
        <DetailPageAsideSummaryField label="Age" value={ageDisplay} />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="System">
        <DetailPageAsideSummaryField
          label="Patient UUID"
          value={
            <span className="break-all font-mono text-xs text-brand-muted">
              {customer.patient_uuid}
            </span>
          }
        />
        <DetailPageAsideSummaryField
          label="Registered"
          value={formatDisplayDate(customer.created_at)}
        />
        <DetailPageAsideSummaryField
          label="Last Updated"
          value={formatDisplayDate(customer.updated_at)}
        />
        <DetailPageAsideSummaryField
          label={ERP_SYNC_LABELS.fieldLabel}
          value={formatErpSyncStatus(customer.has_synced_to_odoo)}
        />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="Account">
        <DetailPageAsideSummaryField
          label="Billing"
          value={
            <span className="text-brand-muted">
              Billing summaries will appear once connected to the billing service.
            </span>
          }
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
