"use client";

import { Calendar } from "lucide-react";
import type { ReactNode } from "react";

import {
  DetailPageDescription,
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import type { InventoryBatch } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";

type BatchDetailHeaderProps = {
  batch: InventoryBatch;
  actions?: ReactNode;
};

export function BatchDetailHeader({ batch, actions }: BatchDetailHeaderProps) {
  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <DetailPageTitle>{batch.batch_number}</DetailPageTitle>

          <DetailPageDescription className="font-mono">
            Product {batch.product_id}
          </DetailPageDescription>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Created {formatDisplayDateTime(batch.created_at)}
            </span>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}
