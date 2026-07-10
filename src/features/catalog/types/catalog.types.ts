import type { InventoryProductMeta } from "@/features/inventory/types/inventory.types";

export type CatalogProductType = "product" | "consu" | "service";

export type CatalogProduct = {
  id?: number;
  uuid: string;
  name: string;
  display_name: string;
  default_code?: string | null;
  barcode?: string | null;
  list_price?: number | string | null;
  standard_price?: number | string | null;
  uom_name?: string | null;
  product_type?: CatalogProductType | null;
  product_type_label?: string | null;
  invoice_policy?: "order" | "delivery" | null;
  charge_occurrences?: number;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  active?: boolean;
  is_active?: boolean;
  metadata?: InventoryProductMeta | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogPricelist = {
  uuid: string;
  name: string;
  is_active: boolean;
  currency_code: string;
};

export type CatalogPricelistMembership = {
  uuid?: string;
  pricelist_uuid: string;
  pricelist_name?: string;
  product_uuid: string;
  product_name?: string;
  fixed_price?: number | string | null;
  min_quantity?: number | string | null;
  date_start?: string | null;
  date_end?: string | null;
};

export type CatalogPriceChange = {
  uuid: string;
  pricelist_uuid: string;
  pricelist_item_uuid?: string | null;
  product_uuid: string;
  action: "ADD" | "UPDATE" | "REMOVE";
  status: "PENDING" | "APPROVED" | "REJECTED" | "APPLIED";
  old_price?: number | string | null;
  new_price?: number | string | null;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
};

export type CatalogPriceChangeMutationResult = {
  approval_required: boolean;
  change: CatalogPriceChange;
  record?: CatalogPricelistMembership;
  applied_payload?: Record<string, unknown>;
};

export type CatalogPricelistCopyJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "partially_completed"
  | "failed";

export type CatalogPricelistCopyJobItemStatus = "pending" | "succeeded" | "failed";

export type CatalogPricelistCopyJob = {
  uuid: string;
  status: CatalogPricelistCopyJobStatus;
  target_pricelist_uuid: string;
  source_pricelist_uuid: string;
  source_pricelist_name: string;
  total_items: number;
  succeeded_items: number;
  failed_items: number;
  failure_code?: string;
  failure_message?: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogPricelistCopyJobItem = {
  product_uuid: string;
  product_name: string;
  fixed_price: string;
  min_quantity: string;
  date_start?: string | null;
  date_end?: string | null;
  status: CatalogPricelistCopyJobItemStatus;
  error_code?: string;
  error_message?: string;
};

export type StartCatalogPricelistCopyPayload = {
  source_pricelist_uuid: string;
};

export type CatalogApprovalConfiguration = {
  uuid: string;
  require_two_person_approval: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PricelistRuleType = "CO_PAYMENT" | "EXCESS" | "FORMULA";

export type CatalogPricelistRule = {
  uuid: string;
  name: string;
  scope_type: "ALL" | "PRODUCT";
  rule_types: PricelistRuleType[];
  client_liability_formula?: string | null;
  insurer_max_amount?: string | null;
  is_active: boolean;
  product_uuids?: string[];
  product_names?: string[];
};

export type CatalogPricelistRuleWritePayload = {
  name?: string;
  scope_type: "ALL" | "PRODUCT";
  rule_types: PricelistRuleType[];
  client_liability_formula?: string;
  insurer_max_amount?: string | null;
  is_active?: boolean;
  product_uuids?: string[];
};

export type CatalogProductImportJob = {
  uuid: string;
  original_filename: string;
  file_format: "csv" | "xlsx";
  status: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  created_products: number;
  updated_products: number;
  failure_code?: string;
  failure_message?: string;
  created_at?: string;
  updated_at?: string;
};

export type CatalogListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  product_type?: string;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  default_code?: string;
  barcode?: string;
  include_inactive?: boolean;
  currency_code?: string;
};

export type CreateCatalogProductPayload = {
  name: string;
  display_name?: string;
  default_code?: string;
  barcode?: string;
  list_price?: number;
  standard_price?: number;
  uom_name?: string;
  product_type?: CatalogProductType;
  invoice_policy?: "order" | "delivery";
  charge_occurrences?: number;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  active?: boolean;
  metadata?: InventoryProductMeta;
};

export type CreateCatalogPricelistPayload = {
  name: string;
  currency_code?: string;
  is_active?: boolean;
};

export type UpdateCatalogPricelistPayload = {
  name?: string;
  currency_code?: string;
  is_active?: boolean;
};

export type AddCatalogPricelistProductPayload = {
  product_uuid: string;
  fixed_price: number | string;
  min_quantity?: number | string;
  date_start?: string | null;
  date_end?: string | null;
};

export type UpdateCatalogPricelistProductPayload = {
  fixed_price?: number | string;
  min_quantity?: number | string;
  date_start?: string | null;
  date_end?: string | null;
};

export type OrganizationDefaultPricelistUuid = {
  tenant_uuid: string;
  default_pricelist_uuid: string | null;
};

export type SetOrganizationDefaultPricelistUuidPayload = {
  default_pricelist_uuid: string | null;
};
