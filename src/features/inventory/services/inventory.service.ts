import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import {
  createCatalogProduct,
  fetchCatalogProduct,
  fetchCatalogProducts,
  updateCatalogProduct,
} from "@/features/catalog/services/catalog.service";
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
  const response = await fetchCatalogProducts({
    search: options.q,
    active: options.active,
    pageSize: 200,
  });
  return response.results;
}

export async function fetchInventoryProduct(
  productUuid: string,
): Promise<InventoryProduct> {
  return fetchCatalogProduct(productUuid);
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
  return createCatalogProduct(payload);
}

export type UpdateInventoryProductPayload = CreateInventoryProductPayload;

export async function updateInventoryProduct(
  productUuid: string,
  payload: UpdateInventoryProductPayload,
): Promise<InventoryProduct> {
  return updateCatalogProduct(productUuid, payload);
}

export async function fetchInventoryProductPricelists(
  productUuid: string,
): Promise<InventoryProductPricelistItem[]> {
  const response = await bffRequest<PaginatedListResponse<InventoryProductPricelistItem>>(
    `${BFF_INVENTORY_ROUTES.products.pricelists(productUuid)}?page_size=200`,
  );
  return response.results;
}

export async function fetchProductTariffCodes(
  productUuid: string,
): Promise<ProductTariffCode[]> {
  return bffRequest<ProductTariffCode[]>(
    BFF_INVENTORY_ROUTES.products.tariffCodes(productUuid),
  );
}

export async function createProductTariffCode(
  productUuid: string,
  payload: CreateProductTariffCodePayload,
): Promise<ProductTariffCode> {
  return bffRequest<ProductTariffCode>(
    BFF_INVENTORY_ROUTES.products.tariffCodes(productUuid),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateProductTariffCode(
  productUuid: string,
  schemeUuid: string,
  payload: UpdateProductTariffCodePayload,
): Promise<ProductTariffCode> {
  return bffRequest<ProductTariffCode>(
    BFF_INVENTORY_ROUTES.products.tariffCodeDetail(productUuid, schemeUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function deleteProductTariffCode(
  productUuid: string,
  schemeUuid: string,
): Promise<void> {
  await bffRequest<void>(
    BFF_INVENTORY_ROUTES.products.tariffCodeDetail(productUuid, schemeUuid),
    { method: "DELETE" },
  );
}

export async function addProductToPricelist(
  pricelistUuid: string,
  payload: AddPricelistProductPayload,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.products(pricelistUuid),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updatePricelistProductPrice(
  pricelistUuid: string,
  productUuid: string,
  payload: UpdatePricelistProductPricePayload,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.productDetail(pricelistUuid, productUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function removeProductFromPricelist(
  pricelistUuid: string,
  productUuid: string,
): Promise<PricelistProductMutationResult> {
  return bffRequest<PricelistProductMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.productDetail(pricelistUuid, productUuid),
    { method: "DELETE" },
  );
}

export async function fetchInventoryProductStockLocations(
  productUuid: string,
): Promise<InventoryProductStockLocation[]> {
  return bffRequest<InventoryProductStockLocation[]>(
    BFF_INVENTORY_ROUTES.products.stockLocations(productUuid),
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
