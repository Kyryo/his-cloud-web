"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
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

const summaryActionButtonClassName =
  "rounded-md px-1.5 py-0.5 text-[11px] font-medium text-brand-muted ring-1 ring-brand-border hover:bg-brand-tint hover:text-brand-navy";

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
      <dd className="mt-0.5 break-words text-sm font-semibold text-brand-navy">
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
        <h3 className="text-[11px] font-semibold uppercase text-brand-muted">
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
            <h2 className="text-sm font-semibold text-brand-navy">
              Client Summary
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Client profile and sync details
            </p>
          </div>
          <Badge
            variant={customer.is_active ? "success" : "destructive"}
            className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px]"
          >
            {customer.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <SummarySection
          title="Personal"
          action={
            <button
              type="button"
              className={summaryActionButtonClassName}
              onClick={onUpdateClick}
              data-testid="update-customer-button"
            >
              Update
            </button>
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
                  <span className="ml-1 text-xs font-normal text-brand-muted">
                    (estimated)
                  </span>
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
              <span className="break-all font-mono text-xs">
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
              <Badge
                variant={customer.has_synced_to_odoo ? "success" : "destructive"}
                className="rounded-md px-1.5 py-0.5 text-[11px]"
              >
                {formatErpSyncStatus(customer.has_synced_to_odoo)}
              </Badge>
            }
          />
        </SummarySection>

        <SummarySection title="Account">
          <SummaryField
            label="Billing"
            value={
              <span className="text-sm font-normal text-brand-muted">
                Billing summaries will appear once connected to the billing
                service.
              </span>
            }
          />
        </SummarySection>
    </DetailPageAsidePanelSection>
  );
}
