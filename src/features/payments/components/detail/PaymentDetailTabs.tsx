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
import { PaymentDetailClientTab } from "@/features/payments/components/detail/PaymentDetailClientTab";
import { PaymentDetailOverviewTab } from "@/features/payments/components/detail/PaymentDetailOverviewTab";
import { PaymentSummaryPanel } from "@/features/payments/components/detail/PaymentSummaryPanel";
import type { Payment } from "@/features/payments/types/payment.types";
import { cn } from "@/lib/utils";

type PaymentDetailTabsProps = {
  payment: Payment;
};

type DetailTabId = "overview" | "client";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "client", label: "Client" },
];

export function PaymentDetailTabs({ payment }: PaymentDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("overview");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Payment sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          <PaymentDetailOverviewTab
            payment={payment}
            isActive={activeTab === "overview"}
          />
          <PaymentDetailClientTab
            payment={payment}
            isActive={activeTab === "client"}
          />
        </DetailPageMainSection>

        <PaymentSummaryPanel
          payment={payment}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide payment summary" : "Show payment summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="payment-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
