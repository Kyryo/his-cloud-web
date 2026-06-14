import { BFF_INVENTORY_ROUTES, BFF_SETTINGS_ROUTES } from "@/constants/api";
import type {
  AddPricelistProductPayload,
  CreateProductTariffCodePayload,
  InventoryListFilters,
  InventoryLocationOption,
  InventoryMovement,
  InventoryMovementListResponse,
  InventoryProduct,
  InventoryProductPricelistItem,
  InventoryProductStockLocation,
  InventoryStock,
  InventoryStockListResponse,
  PricelistProductMutationResult,
  ProductTariffCode,
  UpdatePricelistProductPricePayload,
  UpdateProductTariffCodePayload,
} from "@/features/inventory/types/inventory.types";
import { buildInventoryQuery } from "@/features/inventory/utils/inventory-query";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

export async function fetchInventoryStock(
  filters: InventoryListFilters = {},
): Promise<InventoryStockListResponse> {
  return bffRequest<InventoryStockListResponse>(
    `${BFF_INVENTORY_ROUTES.stock.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInventoryStockItem(uuid: string): Promise<InventoryStock> {
  return bffRequest<InventoryStock>(BFF_INVENTORY_ROUTES.stock.detail(uuid));
}

export async function fetchInventoryMovements(
  filters: InventoryListFilters = {},
): Promise<InventoryMovementListResponse> {
  return bffRequest<InventoryMovementListResponse>(
    `${BFF_INVENTORY_ROUTES.movements.list}${buildInventoryQuery(filters)}`,
  );
}

export async function fetchInventoryMovement(uuid: string): Promise<InventoryMovement> {
  return bffRequest<InventoryMovement>(BFF_INVENTORY_ROUTES.movements.detail(uuid));
}

export async function searchInventoryProducts(options: {
  q?: string;
  active?: boolean;
  tenant?: number;
} = {}): Promise<InventoryProduct[]> {
  const params = new URLSearchParams();
  if (options.q?.trim()) {
    params.set("q", options.q.trim());
  }
  if (options.active !== undefined) {
    params.set("active", String(options.active));
  }
  if (options.tenant) {
    params.set("tenant", String(options.tenant));
  }
  const query = params.toString();
  const path = query
    ? `${BFF_INVENTORY_ROUTES.products.search}?${query}`
    : BFF_INVENTORY_ROUTES.products.search;
  return bffRequest<InventoryProduct[]>(path);
}

export async function fetchInventoryProduct(
  productId: number | string,
): Promise<InventoryProduct> {
  return bffRequest<InventoryProduct>(
    BFF_INVENTORY_ROUTES.products.detail(productId),
  );
}

export type CreateInventoryProductPayload = {
  name: string;
  default_code?: string;
  barcode?: string;
  list_price?: number;
  standard_price?: number;
  product_type?: "product" | "consu" | "service";
  sale_ok?: boolean;
  purchase_ok?: boolean;
  active?: boolean;
  is_drug?: boolean;
  liquid_or_cream?: boolean;
  is_procedure?: boolean;
  dental_only_procedure?: boolean;
  opd_only_procedure?: boolean;
  ipd_only_procedure?: boolean;
  physio_only_procedure?: boolean;
  clinic_wide_procedure?: boolean;
  x_meta?: Record<string, unknown>;
};

export async function createInventoryProduct(
  payload: CreateInventoryProductPayload,
): Promise<InventoryProduct> {
  return bffRequest<InventoryProduct>(BFF_INVENTORY_ROUTES.products.list, {
    method: "POST",
    body: payload,
  });
}

export type UpdateInventoryProductPayload = CreateInventoryProductPayload;

export async function updateInventoryProduct(
  productId: number | string,
  payload: UpdateInventoryProductPayload,
): Promise<InventoryProduct> {
  return bffRequest<InventoryProduct>(
    BFF_INVENTORY_ROUTES.products.detail(productId),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function fetchInventoryProductPricelists(
  productId: number | string,
): Promise<InventoryProductPricelistItem[]> {
  return bffRequest<InventoryProductPricelistItem[]>(
    BFF_INVENTORY_ROUTES.products.pricelists(productId),
  );
}

export async function fetchProductTariffCodes(
  productId: number | string,
): Promise<ProductTariffCode[]> {
  return bffRequest<ProductTariffCode[]>(
    BFF_INVENTORY_ROUTES.products.tariffCodes(productId),
  );
}

export async function createProductTariffCode(
  productId: number | string,
  payload: CreateProductTariffCodePayload,
): Promise<ProductTariffCode> {
  return bffRequest<ProductTariffCode>(
    BFF_INVENTORY_ROUTES.products.tariffCodes(productId),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateProductTariffCode(
  productId: number | string,
  schemeUuid: string,
  payload: UpdateProductTariffCodePayload,
): Promise<ProductTariffCode> {
  return bffRequest<ProductTariffCode>(
    BFF_INVENTORY_ROUTES.products.tariffCodeDetail(productId, schemeUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function deleteProductTariffCode(
  productId: number | string,
  schemeUuid: string,
): Promise<void> {
  await bffRequest<void>(
    BFF_INVENTORY_ROUTES.products.tariffCodeDetail(productId, schemeUuid),
    { method: "DELETE" },
  );
}

export async function addProductToPricelist(
  pricelistId: number,
  payload: AddPricelistProductPayload,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_SETTINGS_ROUTES.pricelistAddProduct(pricelistId),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updatePricelistProductPrice(
  pricelistId: number,
  itemId: number,
  payload: UpdatePricelistProductPricePayload,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_SETTINGS_ROUTES.pricelistUpdateProductPrice(pricelistId, itemId),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function removeProductFromPricelist(
  pricelistId: number,
  itemId: number,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_SETTINGS_ROUTES.pricelistRemoveProduct(pricelistId, itemId),
    { method: "DELETE" },
  );
}

export async function fetchInventoryProductStockLocations(
  productId: number | string,
): Promise<InventoryProductStockLocation[]> {
  return bffRequest<InventoryProductStockLocation[]>(
    BFF_INVENTORY_ROUTES.products.stockLocations(productId),
  );
}

export async function fetchInventoryLocations(
  clinicId?: number,
): Promise<PaginatedListResponse<InventoryLocationOption>> {
  const params = new URLSearchParams({ page_size: "200" });
  if (clinicId) {
    params.set("clinic", String(clinicId));
  }
  return bffRequest<PaginatedListResponse<InventoryLocationOption>>(
    `${BFF_INVENTORY_ROUTES.locations}?${params.toString()}`,
  );
}
