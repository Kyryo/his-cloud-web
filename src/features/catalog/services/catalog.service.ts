import { BFF_INVENTORY_ROUTES } from "@/constants/api";
import { normalizeCatalogProduct } from "@/features/catalog/utils/catalog-adapters";
import type {
  AddCatalogPricelistProductPayload,
  CatalogApprovalConfiguration,
  CatalogListFilters,
  CatalogPriceChange,
  CatalogPriceChangeMutationResult,
  CatalogPricelist,
  CatalogPricelistMembership,
  CatalogProduct,
  CreateCatalogPricelistPayload,
  CreateCatalogProductPayload,
  OrganizationDefaultPricelistUuid,
  SetOrganizationDefaultPricelistUuidPayload,
  UpdateCatalogPricelistPayload,
  UpdateCatalogPricelistProductPayload,
} from "@/features/catalog/types/catalog.types";
import type {
  CreateInventoryProductPayload,
  UpdateInventoryProductPayload,
} from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { bffRequest } from "@/lib/bff-client";
import type { PaginatedListResponse } from "@/types/api.types";

function buildCatalogQuery(filters: CatalogListFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.search?.trim()) params.set("q", filters.search.trim());
  if (filters.active !== undefined) params.set("active", String(filters.active));
  if (filters.product_type) params.set("product_type", filters.product_type);
  if (filters.sale_ok !== undefined) params.set("sale_ok", String(filters.sale_ok));
  if (filters.purchase_ok !== undefined) {
    params.set("purchase_ok", String(filters.purchase_ok));
  }
  if (filters.default_code) params.set("default_code", filters.default_code);
  if (filters.barcode) params.set("barcode", filters.barcode);
  if (filters.include_inactive) params.set("include_inactive", "true");
  if (filters.currency_code) params.set("currency_code", filters.currency_code);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCatalogProducts(
  filters: CatalogListFilters = {},
): Promise<PaginatedListResponse<InventoryProduct>> {
  const response = await bffRequest<PaginatedListResponse<CatalogProduct>>(
    `${BFF_INVENTORY_ROUTES.products.list}${buildCatalogQuery(filters)}`,
  );
  return {
    results: response.results.map(normalizeCatalogProduct),
    pagination: response.pagination,
  };
}

export async function fetchCatalogProduct(productUuid: string): Promise<InventoryProduct> {
  const product = await bffRequest<CatalogProduct>(
    BFF_INVENTORY_ROUTES.products.detail(productUuid),
  );
  return normalizeCatalogProduct(product);
}

export async function createCatalogProduct(
  payload: CreateInventoryProductPayload | CreateCatalogProductPayload,
): Promise<InventoryProduct> {
  const body =
    "metadata" in payload && payload.metadata
      ? payload
      : mapProductWritePayload(payload as CreateInventoryProductPayload);
  const product = await bffRequest<CatalogProduct>(BFF_INVENTORY_ROUTES.products.list, {
    method: "POST",
    body,
  });
  return normalizeCatalogProduct(product);
}

export async function updateCatalogProduct(
  productUuid: string,
  payload: UpdateInventoryProductPayload | CreateCatalogProductPayload,
): Promise<InventoryProduct> {
  const body =
    "metadata" in payload && payload.metadata
      ? payload
      : mapProductWritePayload(payload as CreateInventoryProductPayload);
  const product = await bffRequest<CatalogProduct>(
    BFF_INVENTORY_ROUTES.products.detail(productUuid),
    {
      method: "PATCH",
      body,
    },
  );
  return normalizeCatalogProduct(product);
}

export async function archiveCatalogProduct(productUuid: string): Promise<void> {
  await bffRequest(BFF_INVENTORY_ROUTES.products.detail(productUuid), {
    method: "DELETE",
  });
}

export async function fetchCatalogPricelists(
  filters: CatalogListFilters = {},
): Promise<PaginatedListResponse<CatalogPricelist>> {
  return bffRequest<PaginatedListResponse<CatalogPricelist>>(
    `${BFF_INVENTORY_ROUTES.pricelists.list}${buildCatalogQuery(filters)}`,
  );
}

export async function fetchCatalogPricelist(
  pricelistUuid: string,
): Promise<CatalogPricelist> {
  return bffRequest<CatalogPricelist>(
    BFF_INVENTORY_ROUTES.pricelists.detail(pricelistUuid),
  );
}

export async function createCatalogPricelist(
  payload: CreateCatalogPricelistPayload,
): Promise<CatalogPricelist> {
  return bffRequest<CatalogPricelist>(BFF_INVENTORY_ROUTES.pricelists.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateCatalogPricelist(
  pricelistUuid: string,
  payload: UpdateCatalogPricelistPayload,
): Promise<CatalogPricelist> {
  return bffRequest<CatalogPricelist>(
    BFF_INVENTORY_ROUTES.pricelists.detail(pricelistUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function archiveCatalogPricelist(pricelistUuid: string): Promise<void> {
  await bffRequest(BFF_INVENTORY_ROUTES.pricelists.detail(pricelistUuid), {
    method: "DELETE",
  });
}

export async function fetchCatalogPricelistProducts(
  pricelistUuid: string,
  filters: Pick<CatalogListFilters, "page" | "pageSize" | "search"> = {},
): Promise<PaginatedListResponse<CatalogPricelistMembership>> {
  return bffRequest<PaginatedListResponse<CatalogPricelistMembership>>(
    `${BFF_INVENTORY_ROUTES.pricelists.products(pricelistUuid)}${buildCatalogQuery(filters)}`,
  );
}

export async function addCatalogPricelistProduct(
  pricelistUuid: string,
  payload: AddCatalogPricelistProductPayload,
): Promise<CatalogPriceChangeMutationResult> {
  return bffRequest<CatalogPriceChangeMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.products(pricelistUuid),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateCatalogPricelistProduct(
  pricelistUuid: string,
  productUuid: string,
  payload: UpdateCatalogPricelistProductPayload,
): Promise<CatalogPriceChangeMutationResult> {
  return bffRequest<CatalogPriceChangeMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.productDetail(pricelistUuid, productUuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function removeCatalogPricelistProduct(
  pricelistUuid: string,
  productUuid: string,
): Promise<CatalogPriceChangeMutationResult> {
  return bffRequest<CatalogPriceChangeMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.productDetail(pricelistUuid, productUuid),
    {
      method: "DELETE",
    },
  );
}

export async function fetchCatalogPriceChanges(
  filters: Pick<CatalogListFilters, "page" | "pageSize"> & {
    status?: string;
    action?: string;
  } = {},
): Promise<PaginatedListResponse<CatalogPriceChange>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("page_size", String(filters.pageSize));
  if (filters.status) params.set("status", filters.status);
  if (filters.action) params.set("action", filters.action);
  const query = params.toString();
  return bffRequest<PaginatedListResponse<CatalogPriceChange>>(
    `${BFF_INVENTORY_ROUTES.pricelists.priceChanges}${query ? `?${query}` : ""}`,
  );
}

export async function confirmCatalogPriceChange(
  changeUuid: string,
): Promise<CatalogPriceChangeMutationResult> {
  return bffRequest<CatalogPriceChangeMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.confirmPriceChange(changeUuid),
    { method: "POST" },
  );
}

export async function rejectCatalogPriceChange(
  changeUuid: string,
  reason: string,
): Promise<CatalogPriceChangeMutationResult> {
  return bffRequest<CatalogPriceChangeMutationResult>(
    BFF_INVENTORY_ROUTES.pricelists.rejectPriceChange(changeUuid),
    {
      method: "POST",
      body: { reason },
    },
  );
}

export async function fetchCatalogApprovalConfiguration(): Promise<CatalogApprovalConfiguration> {
  return bffRequest<CatalogApprovalConfiguration>(
    BFF_INVENTORY_ROUTES.pricelists.approvalConfiguration,
  );
}

export async function updateCatalogApprovalConfiguration(
  requireTwoPersonApproval: boolean,
): Promise<CatalogApprovalConfiguration> {
  return bffRequest<CatalogApprovalConfiguration>(
    BFF_INVENTORY_ROUTES.pricelists.approvalConfiguration,
    {
      method: "PATCH",
      body: { require_two_person_approval: requireTwoPersonApproval },
    },
  );
}

export async function fetchOrganizationDefaultPricelistUuid(): Promise<OrganizationDefaultPricelistUuid> {
  return bffRequest<OrganizationDefaultPricelistUuid>(
    BFF_INVENTORY_ROUTES.pricelists.default,
  );
}

export async function setOrganizationDefaultPricelistUuid(
  payload: SetOrganizationDefaultPricelistUuidPayload,
): Promise<OrganizationDefaultPricelistUuid> {
  return bffRequest<OrganizationDefaultPricelistUuid>(
    BFF_INVENTORY_ROUTES.pricelists.default,
    {
      method: "POST",
      body: payload,
    },
  );
}

function mapProductWritePayload(payload: CreateInventoryProductPayload) {
  const metadata = {
    is_drug: payload.is_drug,
    liquid_or_cream: payload.liquid_or_cream,
    is_procedure: payload.is_procedure,
    dental_only_procedure: payload.dental_only_procedure,
    opd_only_procedure: payload.opd_only_procedure,
    ipd_only_procedure: payload.ipd_only_procedure,
    physio_only_procedure: payload.physio_only_procedure,
    clinic_wide_procedure: payload.clinic_wide_procedure,
    ...(payload.x_meta ?? {}),
  };

  return {
    name: payload.name,
    default_code: payload.default_code,
    barcode: payload.barcode,
    list_price: payload.list_price,
    standard_price: payload.standard_price,
    product_type: payload.product_type,
    sale_ok: payload.sale_ok,
    purchase_ok: payload.purchase_ok,
    active: payload.active,
    metadata,
  };
}
