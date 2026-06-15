"use client";

import { Calendar, Package } from "lucide-react";
import type { ReactNode } from "react";

import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type StockDetailHeaderProps = {
  stock: InventoryStock;
  actions?: ReactNode;
  showPackageIcon?: boolean;
};

export function StockDetailHeader({
  stock,
  actions,
  showPackageIcon = true,
}: StockDetailHeaderProps) {
  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          {showPackageIcon ? (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-muted sm:size-12"
              aria-hidden="true"
            >
              <Package className="size-5 sm:size-6" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {stock.location_name}
            </h1>

            <p className="mt-1 font-mono text-sm text-brand-muted">
              Product {stock.product_id}
              {stock.batch_number ? ` · Batch ${stock.batch_number}` : ""}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Updated {formatDisplayDateTime(stock.updated_at)}
              </span>
            </div>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
