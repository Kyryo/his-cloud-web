"use client";

import { Archive, Calendar, Copy, FileDown, MoreVertical, Pencil } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { PurchaseStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { formatDisplayDateTime } from "@/features/inventory/utils/format-inventory";
import { useToast } from "@/providers/toast-provider";

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
  const { toast } = useToast();

  function showComingSoon(feature: string) {
    toast({
      title: "Coming soon",
      description: `${feature} will be available in a future update.`,
      variant: "info",
    });
  }

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
            {order.updated_at && order.updated_at !== order.created_at ? (
              <span>Last edited {formatDisplayDateTime(order.updated_at)}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Purchase order actions"
                data-testid="purchase-order-actions-menu-button"
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onUpdate ? (
                <DropdownMenuItem
                  onClick={onUpdate}
                  data-testid="purchase-order-update-menu-item"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Update details
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => showComingSoon("Duplicate purchase order")}>
                <Copy className="size-4" aria-hidden="true" />
                Duplicate PO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showComingSoon("Print / export PDF")}>
                <FileDown className="size-4" aria-hidden="true" />
                Print / Export PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-700 focus:text-red-700"
                onClick={() => showComingSoon("Archive")}
              >
                <Archive className="size-4" aria-hidden="true" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {actions}
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
