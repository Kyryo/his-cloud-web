"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { PurchaseStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type PurchaseOrderDetailHeaderProps = {
  order: PurchaseOrder;
  onUpdate?: () => void;
  actions?: ReactNode;
};

export function PurchaseOrderDetailHeader({
  order,
  onUpdate,
  actions,
}: PurchaseOrderDetailHeaderProps) {
  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {onUpdate ? (
        <PrimaryButton type="button" size="sm" onClick={onUpdate}>
          Update
        </PrimaryButton>
      ) : null}
      {actions}
    </div>
  );

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {order.vendor_name}
            </h1>
            <PurchaseStatusBadge status={order.status} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">
            {order.reference_number}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Created {formatDisplayDateTime(order.created_at)}
            </span>
          </div>
        </div>
        <div className="shrink-0">{headerActions}</div>
      </div>
    </DetailPageHeaderSection>
  );
}
