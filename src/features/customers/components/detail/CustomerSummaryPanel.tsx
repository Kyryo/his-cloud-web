"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
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

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-brand-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-normal text-brand-slate">
        {value}
      </dd>
    </div>
  );
}

function SummarySection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-brand-border pt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          {title}
        </h3>
        {action}
      </div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

export function CustomerSummaryPanel({
  customer,
  onUpdateClick,
  className,
}: CustomerSummaryPanelProps) {
  const fullName = formatCustomerName(customer);
  const ageDisplay = formatAdaptiveAge(customer.dob);

  return (
    <DetailPageAsidePanelSection className={className}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-brand-navy">Client Summary</h2>
          <p className="mt-0.5 text-xs text-brand-muted">
            Client profile and sync details
          </p>
        </div>
      </div>

      <SummarySection
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
        <SummaryField label="Name" value={fullName} />
        <SummaryField label="Client ID" value={customer.customer_identifier} />
        <SummaryField label="Phone" value={customer.phone_number ?? "—"} />
        <SummaryField label="Email" value={customer.email ?? "—"} />
        <SummaryField label="Gender" value={customer.gender} />
        <SummaryField
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
        <SummaryField label="Age" value={ageDisplay} />
      </SummarySection>

      <SummarySection title="System">
        <SummaryField
          label="Patient UUID"
          value={
            <span className="break-all font-mono text-xs text-brand-muted">
              {customer.patient_uuid}
            </span>
          }
        />
        <SummaryField
          label="Registered"
          value={formatDisplayDate(customer.created_at)}
        />
        <SummaryField
          label="Last Updated"
          value={formatDisplayDate(customer.updated_at)}
        />
        <SummaryField
          label={ERP_SYNC_LABELS.fieldLabel}
          value={
            <span className="text-sm text-brand-slate">
              {formatErpSyncStatus(customer.has_synced_to_odoo)}
            </span>
          }
        />
      </SummarySection>

      <SummarySection title="Account">
        <SummaryField
          label="Billing"
          value={
            <span className="text-sm text-brand-muted">
              Billing summaries will appear once connected to the billing service.
            </span>
          }
        />
      </SummarySection>
    </DetailPageAsidePanelSection>
  );
}
