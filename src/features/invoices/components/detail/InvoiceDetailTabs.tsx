"use client";

import { useMemo, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import { InvoiceClaimsTab } from "@/features/invoices/components/detail/InvoiceClaimsTab";
import { InvoiceDetailClientTab } from "@/features/invoices/components/detail/InvoiceDetailClientTab";
import { InvoiceDetailLinesTab } from "@/features/invoices/components/detail/InvoiceDetailLinesTab";
import { InvoiceDetailPaymentsTab } from "@/features/invoices/components/detail/InvoiceDetailPaymentsTab";
import { InvoiceDetailActivityTab } from "@/features/invoices/components/detail/InvoiceDetailActivityTab";
import { InvoiceDiagnosesTab } from "@/features/invoices/components/detail/InvoiceDiagnosesTab";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { hasInvoiceClaimReadinessIssues } from "@/features/invoices/utils/invoice-claim-readiness";
import {
  INVOICE_DETAIL_TABS,
  type InvoiceDetailTabId,
} from "@/features/invoices/utils/invoice-detail-tabs";

type InvoiceDetailTabsProps = {
  invoice: Invoice;
  activeTab?: InvoiceDetailTabId;
  onActiveTabChange?: (tab: InvoiceDetailTabId) => void;
  onInvoiceRefresh?: () => void | Promise<void>;
};

export function InvoiceDetailTabs({
  invoice,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onInvoiceRefresh,
}: InvoiceDetailTabsProps) {
  const showClaimTab = isInsuranceInvoice(invoice);
  const [claimTabHasIssues, setClaimTabHasIssues] = useState(
    () => showClaimTab && hasInvoiceClaimReadinessIssues(invoice),
  );

  const tabs = useMemo(
    () =>
      INVOICE_DETAIL_TABS.filter((tab) => tab.id !== "claim" || showClaimTab),
    [showClaimTab],
  );

  const [internalActiveTab, setInternalActiveTab] =
    useState<InvoiceDetailTabId>("client");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const lineCount = invoice.lines?.length ?? invoice.line_ids?.length ?? 0;

  function handleTabChange(tab: InvoiceDetailTabId) {
    if (onActiveTabChange) {
      onActiveTabChange(tab);
      return;
    }
    setInternalActiveTab(tab);
  }

  return (
    <DetailPageTabsSection>
      <section className="border-b border-dash-border/80 px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-brand-navy">Items</h2>
          <p className="text-xs text-brand-muted">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </p>
        </div>
        <InvoiceDetailLinesTab
          invoice={invoice}
          isActive
          onInvoiceRefresh={onInvoiceRefresh}
        />
      </section>

      <DetailPageTabsNavSection aria-label="Invoice sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className="inline-flex items-center justify-start gap-1 px-2 py-1.5 text-left"
          >
            <span aria-hidden="true" className="inline-flex">
              <AppIcon name={tab.icon} size={14} className="size-3.5" />
            </span>
            {tab.label}
            {tab.id === "claim" && claimTabHasIssues ? (
              <span
                className="size-2 rounded-full bg-red-500"
                aria-label="Claim issues"
              />
            ) : null}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainSection>
        <InvoiceDetailClientTab
          invoice={invoice}
          isActive={activeTab === "client"}
        />
        {showClaimTab ? (
          <InvoiceClaimsTab
            invoice={invoice}
            isActive={activeTab === "claim"}
            onInvoiceRefresh={onInvoiceRefresh}
            onClaimIndicatorChange={setClaimTabHasIssues}
          />
        ) : null}
        <InvoiceDetailPaymentsTab
          invoice={invoice}
          isActive={activeTab === "payments"}
        />
        <InvoiceDiagnosesTab
          invoice={invoice}
          isActive={activeTab === "diagnoses"}
          onInvoiceRefresh={onInvoiceRefresh}
        />
        <InvoiceDetailActivityTab
          invoice={invoice}
          isActive={activeTab === "activity"}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
