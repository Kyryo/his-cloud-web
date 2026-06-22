"use client";

import { ProductDetailFieldList } from "@/features/inventory/components/detail/ProductDetailFieldList";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { cn } from "@/lib/utils";

type PricelistDetailSummaryTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

export function PricelistDetailSummaryTab({
  pricelist,
  isActive,
}: PricelistDetailSummaryTabProps) {
  return (
    <div
      className={cn("space-y-4", !isActive && "hidden")}
      data-testid="pricelist-summary-tab"
    >
      <ProductDetailFieldList
        title="Pricelist details"
        fields={[
          { label: "Name", value: pricelist.name },
          { label: "Currency", value: pricelist.currency_code },
          {
            label: "Status",
            value: pricelist.is_active ? "Active" : "Archived",
          },
        ]}
      />
    </div>
  );
}
