"use client";

import { PanelRight } from "lucide-react";
import { useMemo, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
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
import { InvoiceSummaryPanel } from "@/features/invoices/components/detail/InvoiceSummaryPanel";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { hasInvoiceClaimReadinessIssues } from "@/features/invoices/utils/invoice-claim-readiness";
import {
  INVOICE_DETAIL_TABS,
  type InvoiceDetailTabId,
} from "@/features/invoices/utils/invoice-detail-tabs";
import { cn } from "@/lib/utils";

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
    useState<InvoiceDetailTabId>("lines");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  function handleTabChange(tab: InvoiceDetailTabId) {
    if (onActiveTabChange) {
      onActiveTabChange(tab);
      return;
    }
    setInternalActiveTab(tab);
  }

  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const lineCount = invoice.lines?.length ?? invoice.line_ids?.length ?? 0;

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Invoice sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className="inline-flex items-center justify-start gap-1.5 px-3 py-2 text-left"
          >
            <span aria-hidden="true" className="inline-flex">
              <AppIcon name={tab.icon} size={14} className="size-3.5" />
            </span>
            <span>{tab.label}</span>
            {tab.id === "lines" && lineCount > 0 ? (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[11px] font-medium text-brand-slate">
                {lineCount}
              </span>
            ) : null}
            {tab.id === "claim" && claimTabHasIssues ? (
              <span
                className="size-2 rounded-full bg-red-500"
                aria-label="Claim issues"
              />
            ) : null}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection className="px-4 py-5 sm:px-6">
          <InvoiceDetailLinesTab
            invoice={invoice}
            isActive={activeTab === "lines"}
            onInvoiceRefresh={onInvoiceRefresh}
          />
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

        <InvoiceSummaryPanel
          invoice={invoice}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide invoice summary" : "Show invoice summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="invoice-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
