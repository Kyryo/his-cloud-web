import { Badge } from "@/components/ui/badge";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import {
  formatProductTypeLabel,
  getProductTypeBadgeVariant,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductTypeBadgeProps = {
  product: Pick<InventoryProduct, "product_type" | "product_type_label">;
  className?: string;
};

export function ProductTypeBadge({ product, className }: ProductTypeBadgeProps) {
  return (
    <Badge
      variant={getProductTypeBadgeVariant(product.product_type_label)}
      className={cn("font-normal capitalize", className)}
    >
      {formatProductTypeLabel(product)}
    </Badge>
  );
}
