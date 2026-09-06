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
import { SalesOrderDetailActivityTab } from "@/features/sales-orders/components/detail/SalesOrderDetailActivityTab";
import { SalesOrderDetailClientTab } from "@/features/sales-orders/components/detail/SalesOrderDetailClientTab";
import { SalesOrderDetailLinesTab } from "@/features/sales-orders/components/detail/SalesOrderDetailLinesTab";
import { SalesOrderDetailVisitTab } from "@/features/sales-orders/components/detail/SalesOrderDetailVisitTab";
import { SalesOrderSummaryPanel } from "@/features/sales-orders/components/detail/SalesOrderSummaryPanel";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  SALES_ORDER_DETAIL_TABS,
  type SalesOrderDetailTabId,
} from "@/features/sales-orders/utils/sales-order-detail-tabs";
import { cn } from "@/lib/utils";

type SalesOrderDetailTabsProps = {
  order: SalesOrder;
  onOrderUpdated: (order: SalesOrder) => void;
  onSplitMismatchChange?: (hasMismatch: boolean) => void;
};

export function SalesOrderDetailTabs({
  order,
  onOrderUpdated,
  onSplitMismatchChange,
}: SalesOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<SalesOrderDetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const lineCount = order.lines?.length ?? order.line_ids?.length ?? 0;

  return (
    <DetailPageTabsSection data-testid="sales-order-detail-tabs">
      <DetailPageTabsNavSection aria-label="Sales order sections">
        {SALES_ORDER_DETAIL_TABS.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="inline-flex items-center justify-start gap-1 px-2 py-1.5 text-left"
          >
            <span aria-hidden="true" className="inline-flex">
              <AppIcon name={tab.icon} size={14} className="size-3.5" />
            </span>
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
