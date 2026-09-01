"use client";

import { Button } from "@/components/ui/button";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { CustomerAccountSummaryCard } from "@/features/customers/components/detail/CustomerAccountSummaryCard";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";
import { TagBadgeList } from "@/features/tags/components/TagBadgeList";
import type { Tag } from "@/features/tags/types/tag.types";

type CustomerSummaryPanelProps = {
  customer: Customer;
  onUpdateClick: () => void;
  onTagsUpdated?: (tags: Tag[]) => void;
  onManageTagsClick?: () => void;
  billingRefreshKey?: number;
  onOpeningBalanceUpdated?: (customer: Customer) => void;
  onBillingUpdated?: () => void;
  className?: string;
};

export function CustomerSummaryPanel({
  customer,
  onUpdateClick,
  onManageTagsClick,
  billingRefreshKey = 0,
  onOpeningBalanceUpdated,
  onBillingUpdated,
  className,
}: CustomerSummaryPanelProps) {
  const fullName = formatCustomerName(customer);
  const ageDisplay = formatAdaptiveAge(customer.dob);

  return (
    <DetailPageAsidePanelSection className={className}>
      <DetailPageAsidePanelHeader
        title="Client Summary"
        description="Account and profile details"
      />

      <CustomerAccountSummaryCard
        customer={customer}
        refreshKey={billingRefreshKey}
        onOpeningBalanceUpdated={onOpeningBalanceUpdated}
        onBillingUpdated={onBillingUpdated}
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
          value={
            <span className="inline-flex items-center rounded border border-dash-border/80 bg-dash-canvas px-1.5 py-0.5 font-mono text-xs font-semibold text-brand-navy">
              {customer.customer_identifier}
            </span>
          }
        />
        <DetailPageAsideSummaryField
          label="Internal reference"
          value={
            customer.internal_reference ? (
              <span className="font-mono text-xs text-brand-slate">
                {customer.internal_reference}
              </span>
            ) : (
              "—"
            )
          }
        />
        <DetailPageAsideSummaryField
          label="Phone"
          value={
            customer.phone_number ? (
              <a
                href={`tel:${customer.phone_number}`}
                className="text-brand-slate hover:text-brand-navy hover:underline"
              >
                {customer.phone_number}
              </a>
            ) : (
              "—"
            )
          }
        />
        <DetailPageAsideSummaryField
          label="Email"
          value={
            customer.email ? (
              <a
                href={`mailto:${customer.email}`}
                className="break-all text-brand-slate hover:text-brand-navy hover:underline"
              >
                {customer.email}
              </a>
            ) : (
              "—"
            )
          }
        />
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

      <DetailPageAsideSummarySection
        title="Tags"
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
            onClick={onManageTagsClick}
            data-testid="manage-customer-tags-button"
          >
            Manage tags
          </Button>
        }
      >
        <TagBadgeList
          tags={customer.tags}
          emptyLabel="No tags assigned."
          onTagClick={onManageTagsClick}
        />
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
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}
