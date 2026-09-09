import { Badge } from "@/components/ui/badge";
import type {
  InternalOrderStatus,
  PurchaseStatus,
  StockAdjustmentStatus,
} from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatInternalOrderStatusLabel,
  formatMovementTypeLabel,
  formatPurchaseStatusLabel,
  formatStockAdjustmentStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

function getPurchaseStatusVariant(status: PurchaseStatus): BadgeVariant {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "SUBMITTED":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    default:
      return "outline";
  }
}

function getInternalOrderStatusVariant(status: InternalOrderStatus): BadgeVariant {
  switch (status) {
    case "APPROVED":
    case "RECEIVED":
      return "success";
    case "SUBMITTED":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    case "DISPATCHED":
      return "default";
    case "DRAFT":
      return "secondary";
    default:
      return "outline";
  }
}

function getStockAdjustmentStatusVariant(
  status: StockAdjustmentStatus,
): BadgeVariant {
  switch (status) {
    case "APPROVED":
    case "APPLIED":
      return "success";
    case "SUBMITTED":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    default:
      return "outline";
  }
}

type StatusBadgeProps = {
  className?: string;
};

export function PurchaseStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: PurchaseStatus }) {
  return (
    <Badge
      variant={getPurchaseStatusVariant(status)}
      className={cn("font-normal", className)}
    >
      {formatPurchaseStatusLabel(status)}
    </Badge>
  );
}

export function InternalOrderStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: InternalOrderStatus }) {
  return (
    <Badge
      variant={getInternalOrderStatusVariant(status)}
      className={cn("font-normal", className)}
    >
      {formatInternalOrderStatusLabel(status)}
    </Badge>
  );
}

export function StockAdjustmentStatusBadge({
  status,
  className,
}: StatusBadgeProps & { status: StockAdjustmentStatus }) {
  return (
    <Badge
      variant={getStockAdjustmentStatusVariant(status)}
      className={cn("font-normal", className)}
    >
      {formatStockAdjustmentStatusLabel(status)}
    </Badge>
  );
}

function getAdjustmentTypeVariant(type: string): BadgeVariant {
  switch (type) {
    case "QUANTITY":
      return "warning";
    case "COST":
      return "secondary";
    default:
      return "outline";
  }
}

function getMovementTypeVariant(type: string): BadgeVariant {
  switch (type) {
    case "PURCHASE_RECEIPT":
    case "INTERNAL_ORDER_IN":
      return "success";
    case "INTERNAL_ORDER_OUT":
      return "default";
    case "ADJUSTMENT_QTY":
      return "warning";
    case "RETURN_TO_VENDOR":
      return "destructive";
    default:
      return "outline";
  }
}

export function AdjustmentTypeBadge({
  type,
  className,
}: StatusBadgeProps & { type: string }) {
  return (
    <Badge
      variant={getAdjustmentTypeVariant(type)}
      className={cn("font-normal", className)}
    >
      {formatAdjustmentTypeLabel(type)}
    </Badge>
  );
}

export function MovementTypeBadge({
  type,
  className,
}: StatusBadgeProps & { type: string }) {
  return (
    <Badge
      variant={getMovementTypeVariant(type)}
      className={cn("font-normal", className)}
    >
      {formatMovementTypeLabel(type)}
    </Badge>
  );
}
