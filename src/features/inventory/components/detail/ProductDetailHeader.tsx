"use client";

import type { ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  DetailPageDescription,
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductTypeLabel } from "@/features/inventory/utils/format-inventory";

type ProductDetailHeaderProps = {
  product: InventoryProduct;
  onUpdate?: () => void;
  actions?: ReactNode;
};

export function ProductDetailHeader({
  product,
  onUpdate,
  actions,
}: ProductDetailHeaderProps) {
  const defaultActions = onUpdate ? (
    <PrimaryButton type="button" size="sm" onClick={onUpdate}>
      Update
    </PrimaryButton>
  ) : null;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DetailPageTitle>{product.display_name || product.name}</DetailPageTitle>
            {!product.is_active ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-brand-muted">
                Inactive
              </span>
            ) : null}
          </div>

          <DetailPageDescription className="capitalize">
            {formatProductTypeLabel(product)}
          </DetailPageDescription>
        </div>
        <div className="shrink-0">{actions ?? defaultActions}</div>
      </div>
    </DetailPageHeaderSection>
  );
}
