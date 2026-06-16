"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InvoiceDetailClientTab } from "@/features/invoices/components/detail/InvoiceDetailClientTab";
import { InvoiceDetailLinesTab } from "@/features/invoices/components/detail/InvoiceDetailLinesTab";
import { InvoiceDetailPaymentsTab } from "@/features/invoices/components/detail/InvoiceDetailPaymentsTab";
import { InvoiceSummaryPanel } from "@/features/invoices/components/detail/InvoiceSummaryPanel";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { cn } from "@/lib/utils";

type InvoiceDetailTabsProps = {
  invoice: Invoice;
};

type DetailTabId = "lines" | "payments" | "client";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "lines", label: "Line items" },
  { id: "payments", label: "Payments" },
  { id: "client", label: "Client" },
];

export function InvoiceDetailTabs({ invoice }: InvoiceDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const lineCount = invoice.lines?.length ?? invoice.line_ids?.length ?? 0;

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Invoice sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === "lines" && lineCount > 0 ? ` (${lineCount})` : ""}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          <InvoiceDetailLinesTab invoice={invoice} isActive={activeTab === "lines"} />
          <InvoiceDetailPaymentsTab
            invoice={invoice}
            isActive={activeTab === "payments"}
          />
          <InvoiceDetailClientTab invoice={invoice} isActive={activeTab === "client"} />
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
