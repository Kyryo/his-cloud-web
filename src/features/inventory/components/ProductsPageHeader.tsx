"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { ProductsListToolbar } from "@/features/inventory/components/ProductsListToolbar";
import type { ProductSheetFilters } from "@/features/inventory/utils/inventory-list-filters";

type ProductsPageHeaderProps = {
  search: string;
  filters: ProductSheetFilters;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ProductSheetFilters) => void;
  onNewProduct: () => void;
};

export function ProductsPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onNewProduct,
}: ProductsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ProductsListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            onClick={onNewProduct}
            data-testid="add-product-button"
          >
            <AppIcon name="add" className="size-3.5" />
            <span>New Product</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
