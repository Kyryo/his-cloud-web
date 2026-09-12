import {
  ArrowDownUp,
  ArrowLeftRight,
  ClipboardList,
  FileText,
  Package,
  type LucideIcon,
} from "lucide-react";

import {
  getInventoryMarkWash,
  type InventoryMarkKind,
} from "@/features/inventory/utils/inventory-mark";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<InventoryMarkKind, LucideIcon> = {
  product: Package,
  "purchase-order": FileText,
  "internal-order": ArrowLeftRight,
  adjustment: ClipboardList,
  movement: ArrowDownUp,
};

type InventoryMarkProps = {
  kind: InventoryMarkKind;
  seed: string;
  size?: "sm" | "lg";
  className?: string;
};

export function InventoryMark({
  kind,
  seed,
  size = "sm",
  className,
}: InventoryMarkProps) {
  const Icon = KIND_ICON[kind];
  const wash = getInventoryMarkWash(kind, seed);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
        size === "lg" ? "size-11" : "size-8",
        wash,
        className,
      )}
      aria-hidden="true"
    >
      <Icon
        className={size === "lg" ? "size-5" : "size-4"}
        strokeWidth={1.75}
      />
    </span>
  );
}
