"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

type ProductDetailHeaderProps = {
  product: InventoryProduct;
  actions?: ReactNode;
};

export function ProductDetailHeader({ product, actions }: ProductDetailHeaderProps) {
  const defaultActions = (
    <SecondaryButton asChild size="sm">
      <Link href={`${ROUTES.inventoryStock}?odoo_product_id=${product.id}`}>
        View stock
      </Link>
    </SecondaryButton>
  );

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
            {product.display_name || product.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-brand-muted">#{product.id}</p>
        </div>
        <div className="shrink-0">{actions ?? defaultActions}</div>
      </div>
    </DetailPageHeaderSection>
  );
}
