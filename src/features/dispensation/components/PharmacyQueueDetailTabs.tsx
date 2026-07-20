"use client";

import { useState } from "react";

import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { PharmacyQueueLineItemsTab } from "@/features/dispensation/components/PharmacyQueueLineItemsTab";
import { PharmacyQueueSummaryPanel } from "@/features/dispensation/components/PharmacyQueueSummaryPanel";
import type {
  DispensationQueueDetail,
  DispensationQueueLine,
} from "@/features/dispensation/types/dispensation.types";
import { SalesOrderDetailActivityTab } from "@/features/sales-orders/components/detail/SalesOrderDetailActivityTab";
import { SalesOrderDetailClientTab } from "@/features/sales-orders/components/detail/SalesOrderDetailClientTab";
import { SalesOrderDetailVisitTab } from "@/features/sales-orders/components/detail/SalesOrderDetailVisitTab";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

type DetailTabId = "lines" | "visit" | "client" | "activity";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "lines", label: "Line items" },
  { id: "visit", label: "Visit" },
  { id: "client", label: "Client" },
  { id: "activity", label: "Activity" },
];

type PharmacyQueueDetailTabsProps = {
  detail: DispensationQueueDetail;
  salesOrder: SalesOrder;
  selectedLineUuids: string[];
  onSelectedLineUuidsChange: (lineUuids: string[]) => void;
  canManageLines: boolean;
  onEdit: (line: DispensationQueueLine) => void;
  onDelete: (line: DispensationQueueLine) => void;
};

export function PharmacyQueueDetailTabs({
  detail,
  salesOrder,
  selectedLineUuids,
  onSelectedLineUuidsChange,
  canManageLines,
  onEdit,
  onDelete,
}: PharmacyQueueDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const lineCount = detail.lines.length;

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Pharmacy queue sections">
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
          <PharmacyQueueLineItemsTab
            detail={detail}
            isActive={activeTab === "lines"}
            selectedLineUuids={selectedLineUuids}
            onSelectedLineUuidsChange={onSelectedLineUuidsChange}
            canManageLines={canManageLines}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <SalesOrderDetailVisitTab
            order={salesOrder}
            isActive={activeTab === "visit"}
          />
          <SalesOrderDetailClientTab
            order={salesOrder}
            isActive={activeTab === "client"}
          />
          <SalesOrderDetailActivityTab
            order={salesOrder}
            isActive={activeTab === "activity"}
          />
        </DetailPageMainSection>

        <PharmacyQueueSummaryPanel detail={detail} />
      </DetailPageMainAsideGrid>
    </DetailPageTabsSection>
  );
}
