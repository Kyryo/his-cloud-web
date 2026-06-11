"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import type { InventoryMovement } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDateTime,
  formatMovementTypeLabel,
} from "@/features/inventory/utils/format-inventory";

type MovementDetailHeaderProps = {
  movement: InventoryMovement;
  actions?: ReactNode;
};

export function MovementDetailHeader({
  movement,
  actions,
}: MovementDetailHeaderProps) {
  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
            {formatMovementTypeLabel(movement.movement_type)}
          </h1>

          <p className="mt-1 font-mono text-sm text-brand-muted">
            Product {movement.odoo_product_id}
            {movement.batch_number ? ` · Batch ${movement.batch_number}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Created {formatDisplayDateTime(movement.created_at)}
            </span>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
