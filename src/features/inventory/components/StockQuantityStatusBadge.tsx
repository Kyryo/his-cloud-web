import { Badge } from "@/components/ui/badge";
import {
  getStockQuantityStatusLabel,
  type StockQuantityStatus,
} from "@/features/inventory/utils/stock-quantity-status";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<StockQuantityStatus, string> = {
  out: "gap-1.5 border-rose-200 bg-rose-50 font-normal text-rose-800",
  low: "gap-1.5 border-amber-200 bg-amber-50 font-normal text-amber-800",
  ok: "gap-1.5 border-emerald-200 bg-emerald-50 font-normal text-emerald-800",
  unknown: "gap-1.5 font-normal text-brand-muted",
};

const STATUS_DOT_CLASS: Record<StockQuantityStatus, string> = {
  out: "bg-rose-500",
  low: "bg-amber-500",
  ok: "bg-emerald-500",
  unknown: "bg-dash-muted",
};

type StockQuantityStatusBadgeProps = {
  status: StockQuantityStatus;
  className?: string;
};

export function StockQuantityStatusBadge({
  status,
  className,
}: StockQuantityStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_BADGE_CLASS[status], className)}
    >
      <span
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASS[status])}
        aria-hidden="true"
      />
      {getStockQuantityStatusLabel(status)}
    </Badge>
  );
}
