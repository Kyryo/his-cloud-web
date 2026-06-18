"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockDetailHeader } from "@/features/inventory/components/detail/StockDetailHeader";
import { StockDetailTabs } from "@/features/inventory/components/detail/StockDetailTabs";
import type { InventoryStock } from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";

type StockDetailDialogProps = {
  stock: InventoryStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StockDetailDialog({
  stock,
  open,
  onOpenChange,
}: StockDetailDialogProps) {
  if (!stock) {
    return null;
  }

  const title = stock.product_name?.trim() || `Product ${stock.product_id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl ${appFont.className}`}
        data-testid="stock-detail-dialog"
      >
        <div className="border-b border-brand-border px-6 pb-4 pt-6">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Stock at {stock.location_name}
            </DialogDescription>
          </DialogHeader>
          <StockDetailHeader stock={stock} showPackageIcon={false} />
        </div>
        <div className="overflow-y-auto px-2 pb-4 sm:px-4">
          <StockDetailTabs stock={stock} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
