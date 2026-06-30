"use client";

import { useState } from "react";

import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { PricelistDetailPriceChangesTab } from "@/features/inventory/components/detail/PricelistDetailPriceChangesTab";
import { PricelistDetailProductsTab } from "@/features/inventory/components/detail/PricelistDetailProductsTab";
import { PricelistDetailRulesTab } from "@/features/inventory/components/detail/PricelistDetailRulesTab";
import { PricelistDetailSummaryTab } from "@/features/inventory/components/detail/PricelistDetailSummaryTab";

type PricelistDetailTabsProps = {
  pricelist: CatalogPricelist;
};

type DetailTabId = "summary" | "products" | "rules" | "approvals";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "products", label: "Products" },
  { id: "rules", label: "Rules" },
  { id: "approvals", label: "Price approvals" },
];

export function PricelistDetailTabs({ pricelist }: PricelistDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("summary");

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Pricelist sections">
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

      <DetailPageMainSection>
        <PricelistDetailSummaryTab pricelist={pricelist} isActive={activeTab === "summary"} />
        <PricelistDetailProductsTab pricelist={pricelist} isActive={activeTab === "products"} />
        <PricelistDetailRulesTab pricelist={pricelist} isActive={activeTab === "rules"} />
        <PricelistDetailPriceChangesTab
          pricelist={pricelist}
          isActive={activeTab === "approvals"}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
