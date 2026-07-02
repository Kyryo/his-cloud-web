"use client";

import { PanelRight } from "lucide-react";
import { useMemo, useState } from "react";

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
import { cn } from "@/lib/utils";

type InvoiceDetailTabsProps = {
  invoice: Invoice;
  activeTab?: DetailTabId;
  onActiveTabChange?: (tab: DetailTabId) => void;
  onInvoiceRefresh?: () => void | Promise<void>;
};

type DetailTabId = "lines" | "client" | "claim" | "payments" | "diagnoses" | "activity";

export function InvoiceDetailTabs({
  invoice,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  onInvoiceRefresh,
}: InvoiceDetailTabsProps) {
  const showClaimTab = isInsuranceInvoice(invoice);
  const showClaimReadinessIndicator =
    showClaimTab && hasInvoiceClaimReadinessIssues(invoice);

  const tabs = useMemo(() => {
    const items: Array<{ id: DetailTabId; label: string }> = [
      { id: "lines", label: "Line items" },
      { id: "client", label: "Client" },
    ];

    if (showClaimTab) {
      items.push({ id: "claim", label: "Claim" });
    }

    items.push({ id: "payments", label: "Payments" });
    items.push({ id: "diagnoses", label: "Diagnoses" });
    items.push({ id: "activity", label: "Activity" });

    return items;
  }, [showClaimTab]);

  const [internalActiveTab, setInternalActiveTab] = useState<DetailTabId>("lines");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  function handleTabChange(tab: DetailTabId) {
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
          >
            <span className="relative inline-flex items-center gap-2">
              {tab.label}
              {tab.id === "lines" && lineCount > 0 ? ` (${lineCount})` : ""}
              {tab.id === "claim" && showClaimReadinessIndicator ? (
                <span
                  className="size-2 rounded-full bg-red-500"
                  aria-label="Claim readiness issues"
                />
              ) : null}
            </span>
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          <InvoiceDetailLinesTab invoice={invoice} isActive={activeTab === "lines"} />
          <InvoiceDetailClientTab invoice={invoice} isActive={activeTab === "client"} />
          {showClaimTab ? (
            <InvoiceClaimsTab
              invoice={invoice}
              isActive={activeTab === "claim"}
              onInvoiceRefresh={onInvoiceRefresh}
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
