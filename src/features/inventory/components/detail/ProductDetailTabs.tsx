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
import { ProductDetailAvailabilityTab } from "@/features/inventory/components/detail/ProductDetailAvailabilityTab";
import { ProductDetailPricelistsTab } from "@/features/inventory/components/detail/ProductDetailPricelistsTab";
import { ProductDetailSummaryTab } from "@/features/inventory/components/detail/ProductDetailSummaryTab";
import { ProductDetailTariffCodesTab } from "@/features/inventory/components/detail/ProductDetailTariffCodesTab";
import { ProductSummaryPanel } from "@/features/inventory/components/detail/ProductSummaryPanel";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { cn } from "@/lib/utils";

type ProductDetailTabsProps = {
  product: InventoryProduct;
};

type DetailTabId = "summary" | "tariff-codes" | "pricelists" | "locations";

const tabs: Array<{ id: DetailTabId; label: string }> = [
  { id: "summary", label: "Summary" },
  { id: "tariff-codes", label: "Tariff codes" },
  { id: "pricelists", label: "Pricelists" },
  { id: "locations", label: "Locations" },
];

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("summary");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Product sections">
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
          <ProductDetailSummaryTab
            product={product}
            isActive={activeTab === "summary"}
          />
          <ProductDetailTariffCodesTab
            product={product}
            isActive={activeTab === "tariff-codes"}
          />
          <ProductDetailPricelistsTab
            product={product}
            isActive={activeTab === "pricelists"}
          />
          <ProductDetailAvailabilityTab
            product={product}
            isActive={activeTab === "locations"}
          />
        </DetailPageMainSection>

        <ProductSummaryPanel
          product={product}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide product summary" : "Show product summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="product-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
