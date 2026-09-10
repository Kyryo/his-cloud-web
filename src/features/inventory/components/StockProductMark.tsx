import { InventoryMark } from "@/features/inventory/components/InventoryMark";

type StockProductMarkProps = {
  name: string;
  size?: "sm" | "lg";
  className?: string;
};

export function StockProductMark({
  name,
  size = "sm",
  className,
}: StockProductMarkProps) {
  return (
    <InventoryMark kind="product" seed={name} size={size} className={className} />
  );
}
