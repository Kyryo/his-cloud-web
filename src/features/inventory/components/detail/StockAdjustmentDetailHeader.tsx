"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { StockAdjustmentStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
} from "@/features/inventory/utils/format-inventory";

type StockAdjustmentDetailHeaderProps = {
  adjustment: StockAdjustment;
  actions?: ReactNode;
};

export function StockAdjustmentDetailHeader({
  adjustment,
  actions,
}: StockAdjustmentDetailHeaderProps) {
  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {formatAdjustmentTypeLabel(adjustment.adjustment_type)} · Location{" "}
              {adjustment.location}
            </h1>
            <StockAdjustmentStatusBadge status={adjustment.status} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">
            {adjustment.reference_number}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Created {formatDisplayDateTime(adjustment.created_at)}
            </span>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
