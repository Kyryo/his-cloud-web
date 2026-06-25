import type { CatalogProduct } from "@/features/catalog/types/catalog.types";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";

/** Map catalog API product payload to legacy inventory UI shape. */
export function normalizeCatalogProduct(product: CatalogProduct): InventoryProduct {
  const metadata = product.metadata ?? {};
  const isActive = product.active ?? product.is_active ?? true;

  return {
    id: product.id,
    uuid: product.uuid,
    name: product.name,
    display_name: product.display_name || product.name,
    default_code: product.default_code ?? null,
    barcode: product.barcode ?? null,
    list_price: product.list_price ?? null,
    standard_price: product.standard_price ?? null,
    uom_name: product.uom_name ?? null,
    is_active: isActive,
    product_type: product.product_type ?? null,
    product_type_label: product.product_type_label ?? null,
    invoice_policy: product.invoice_policy ?? null,
    charge_occurrences: product.charge_occurrences ?? 1,
    sale_ok: product.sale_ok,
    purchase_ok: product.purchase_ok,
    metadata: metadata,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

export function getProductRouteKey(product: Pick<InventoryProduct, "uuid">): string {
  return product.uuid;
}
