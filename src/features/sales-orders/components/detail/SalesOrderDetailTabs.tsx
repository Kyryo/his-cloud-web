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
import { SalesOrderDetailLinesTab } from "@/features/sales-orders/components/detail/SalesOrderDetailLinesTab";
import { SalesOrderDetailOverviewTab } from "@/features/sales-orders/components/detail/SalesOrderDetailOverviewTab";
import { SalesOrderSummaryPanel } from "@/features/sales-orders/components/detail/SalesOrderSummaryPanel";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { cn } from "@/lib/utils";

type SalesOrderDetailTabsProps = {
  order: SalesOrder;
};

type DetailTabId = "overview" | "lines";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "lines", label: "Line items" },
];

export function SalesOrderDetailTabs({ order }: SalesOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("overview");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const lineCount = order.order_lines?.length ?? order.order_line?.length ?? 0;

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Sales order sections">
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
          <SalesOrderDetailOverviewTab
            order={order}
            isActive={activeTab === "overview"}
          />
          <SalesOrderDetailLinesTab
            order={order}
            isActive={activeTab === "lines"}
          />
        </DetailPageMainSection>

        <SalesOrderSummaryPanel
          order={order}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide order summary" : "Show order summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="sales-order-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
