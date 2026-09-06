"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
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
import {
  PAYMENT_DETAIL_TABS,
  type PaymentDetailTabId,
} from "@/features/payments/utils/payment-detail-tabs";
import { cn } from "@/lib/utils";

type PaymentDetailTabsProps = {
  payment: Payment;
};

export function PaymentDetailTabs({ payment }: PaymentDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<PaymentDetailTabId>("overview");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Payment sections">
        {PAYMENT_DETAIL_TABS.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="inline-flex items-center justify-start gap-1.5 px-3 py-2 text-left"
          >
            <span aria-hidden="true" className="inline-flex">
              <AppIcon name={tab.icon} size={14} className="size-3.5" />
            </span>
            <span>{tab.label}</span>
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection className="px-4 py-5 sm:px-6">
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
