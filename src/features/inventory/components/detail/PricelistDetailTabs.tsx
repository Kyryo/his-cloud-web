"use client";

import { useState } from "react";

import {
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { PricelistDetailActivityTab } from "@/features/inventory/components/detail/PricelistDetailActivityTab";
import { PricelistDetailAdvisorPackTab } from "@/features/inventory/components/detail/PricelistDetailAdvisorPackTab";
import { PricelistDetailPriceChangesTab } from "@/features/inventory/components/detail/PricelistDetailPriceChangesTab";
import { PricelistDetailProductsTab } from "@/features/inventory/components/detail/PricelistDetailProductsTab";
import { PricelistDetailRulesTab } from "@/features/inventory/components/detail/PricelistDetailRulesTab";
import { PricelistDetailSettingsTab } from "@/features/inventory/components/detail/PricelistDetailSettingsTab";

type PricelistDetailTabsProps = {
  pricelist: CatalogPricelist;
};

type DetailTabId =
  | "products"
  | "rules"
  | "approvals"
  | "advisor"
  | "settings"
  | "activity";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "products", label: "Products" },
  { id: "rules", label: "Rules" },
  { id: "approvals", label: "Price approvals" },
  { id: "advisor", label: "Claims advisor pack" },
  { id: "settings", label: "Settings" },
  { id: "activity", label: "Activity" },
];

export function PricelistDetailTabs({ pricelist }: PricelistDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("products");

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
        <PricelistDetailProductsTab pricelist={pricelist} isActive={activeTab === "products"} />
        <PricelistDetailRulesTab pricelist={pricelist} isActive={activeTab === "rules"} />
        <PricelistDetailPriceChangesTab
          pricelist={pricelist}
          isActive={activeTab === "approvals"}
        />
        <PricelistDetailAdvisorPackTab
          pricelist={pricelist}
          isActive={activeTab === "advisor"}
        />
        <PricelistDetailSettingsTab
          pricelist={pricelist}
          isActive={activeTab === "settings"}
        />
        <PricelistDetailActivityTab
          pricelist={pricelist}
          isActive={activeTab === "activity"}
        />
      </DetailPageMainSection>
    </DetailPageTabsSection>
  );
}
