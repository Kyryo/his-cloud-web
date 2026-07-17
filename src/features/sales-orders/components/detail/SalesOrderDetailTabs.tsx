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
import { SalesOrderDetailActivityTab } from "@/features/sales-orders/components/detail/SalesOrderDetailActivityTab";
import { SalesOrderDetailClientTab } from "@/features/sales-orders/components/detail/SalesOrderDetailClientTab";
import { SalesOrderDetailLinesTab } from "@/features/sales-orders/components/detail/SalesOrderDetailLinesTab";
import { SalesOrderDetailVisitTab } from "@/features/sales-orders/components/detail/SalesOrderDetailVisitTab";
import { SalesOrderSummaryPanel } from "@/features/sales-orders/components/detail/SalesOrderSummaryPanel";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { cn } from "@/lib/utils";

type SalesOrderDetailTabsProps = {
  order: SalesOrder;
  onOrderUpdated: (order: SalesOrder) => void;
  onSplitMismatchChange?: (hasMismatch: boolean) => void;
};

type DetailTabId = "lines" | "visit" | "client" | "activity";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "lines", label: "Line items" },
  { id: "visit", label: "Visit" },
  { id: "client", label: "Client" },
  { id: "activity", label: "Activity" },
];

export function SalesOrderDetailTabs({
  order,
  onOrderUpdated,
  onSplitMismatchChange,
}: SalesOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const lineCount = order.lines?.length ?? order.line_ids?.length ?? 0;

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
          <SalesOrderDetailLinesTab
            order={order}
            isActive={activeTab === "lines"}
            onOrderUpdated={onOrderUpdated}
            onSplitMismatchChange={onSplitMismatchChange}
          />
          <SalesOrderDetailVisitTab
            order={order}
            isActive={activeTab === "visit"}
          />
          <SalesOrderDetailClientTab
            order={order}
            isActive={activeTab === "client"}
          />
          <SalesOrderDetailActivityTab
            order={order}
            isActive={activeTab === "activity"}
          />
        </DetailPageMainSection>

        <SalesOrderSummaryPanel
          order={order}
          onOrderUpdated={onOrderUpdated}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={
          showSummaryPanel ? "Hide order summary" : "Show order summary"
        }
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
