import type { PaginatedListResponse } from "@/types/api.types";

export type DocumentType =
  | "PURCHASE_ORDER"
  | "INTERNAL_ORDER"
  | "STOCK_ADJUSTMENT"
  | string;

export type PurchaseStatus = "DRAFT" | "SUBMITTED" | "CONFIRMED" | "CANCELLED" | string;

export type InternalOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "DISPATCHED"
  | "RECEIVED"
  | "CANCELLED"
  | string;

export type StockAdjustmentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "APPLIED"
  | "CANCELLED"
  | string;

export type AdjustmentType = "QUANTITY" | "COST" | string;

export type MovementType = string;

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string;

export type InventoryStock = {
  id: number;
  uuid: string;
  tenant: number;
  location: number;
  location_name: string;
  odoo_product_id: number;
  batch: number | null;
  batch_number: string | null;
  quantity_on_hand: string | number;
  average_unit_cost: string | number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryMovement = {
  id: number;
  uuid: string;
  tenant: number;
  movement_type: MovementType;
  reference_model: string | null;
  reference_id: string | null;
  odoo_product_id: number;
  batch: number | null;
  batch_number: string | null;
  from_location: number | null;
  from_location_name: string | null;
  to_location: number | null;
  to_location_name: string | null;
  quantity: string | number;
  unit_cost: string | number | null;
  total_cost: string | number | null;
  notes: string | null;
  created_at: string;
};

export type InventoryProductType = "product" | "consu" | "service" | string;

export type InventoryProductTypeLabel =
  | "stockable"
  | "consumable"
  | "service"
  | string;

export type InventoryProductMeta = {
  created_by?: number | null;
  created_by_name?: string | null;
  is_drug?: boolean;
  liquid_or_cream?: boolean;
  is_procedure?: boolean;
  dental_only_procedure?: boolean;
  opd_only_procedure?: boolean;
  ipd_only_procedure?: boolean;
  physio_only_procedure?: boolean;
  clinic_wide_procedure?: boolean;
  [key: string]: unknown;
};

export type InventoryProduct = {
  id: number;
  name: string;
  display_name: string;
  default_code: string | false | null;
  barcode: string | false | null;
  list_price: number | string | null;
  standard_price: number | string | null;
  uom_id: [number, string] | false | null;
  active: boolean;
  product_type?: InventoryProductType | null;
  product_type_label?: InventoryProductTypeLabel | null;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  x_meta?: InventoryProductMeta | null;
};

export type InventoryProductPricelistItem = {
  id: number;
  applied_on?: string;
  compute_price?: string;
  fixed_price?: number | string | null;
  percent_price?: number | string | null;
  min_quantity?: number | string | null;
  date_start?: string | false | null;
  date_end?: string | false | null;
  pricelist?: { id: number; name: string } | null;
  product?: { id: number; name: string } | null;
  product_template?: { id: number; name: string } | null;
};

export type InventoryProductStockLocation = {
  location: {
    id: number;
    uuid: string;
    name: string;
    code: string;
  };
  clinic: {
    id: number;
    name: string;
  };
  odoo_product_id: number;
  quantity_on_hand: string | number;
};

export type InventoryBatch = {
  id: number;
  uuid: string;
  tenant: number;
  odoo_product_id: number;
  batch_number: string;
  expiry_date: string | null;
  manufacture_date: string | null;
  supplier: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PurchaseOrderLine = {
  id?: number;
  odoo_product_id: number;
  product_name?: string | null;
  batch?: number | null;
  batch_number?: string | null;
  quantity: string | number;
  unit_cost: string | number;
  total_cost?: string | number;
  expiry_date?: string | null;
  notes?: string | null;
};

export type PurchaseOrder = {
  id: number;
  uuid: string;
  tenant: number;
  reference_number: string;
  vendor_name: string;
  vendor_id: number | null;
  lpo_number: string | null;
  grn_number: string | null;
  delivery_date: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  receiving_location: number;
  status: PurchaseStatus;
  created_by: number | null;
  received_by: number | null;
  received_at: string | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
  notes: string | null;
  total_value: string | number | null;
  lines: PurchaseOrderLine[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InternalOrderLine = {
  id?: number;
  odoo_product_id: number;
  batch?: number | null;
  quantity: string | number;
  unit_cost?: string | number | null;
  notes?: string | null;
};

export type InternalOrder = {
  id: number;
  uuid: string;
  tenant: number;
  reference_number: string;
  source_location: number;
  destination_location: number;
  status: InternalOrderStatus;
  requested_by: number | null;
  approved_by: number | null;
  dispatched_by: number | null;
  received_by: number | null;
  approved_at: string | null;
  dispatched_at: string | null;
  received_at: string | null;
  notes: string | null;
  lines: InternalOrderLine[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StockAdjustmentLine = {
  id?: number;
  odoo_product_id: number;
  batch?: number | null;
  quantity_delta: string | number;
  new_unit_cost?: string | number | null;
  notes?: string | null;
};

export type StockAdjustment = {
  id: number;
  uuid: string;
  tenant: number;
  reference_number: string;
  location: number;
  adjustment_type: AdjustmentType;
  status: StockAdjustmentStatus;
  reason: string | null;
  approved_by: number | null;
  applied_by: number | null;
  approved_at: string | null;
  applied_at: string | null;
  notes: string | null;
  lines: StockAdjustmentLine[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryClinicConfiguration = {
  id: number;
  uuid: string;
  clinic: number;
  clinic_name: string;
  tenant: number;
  batch_tracking_enabled: boolean;
  purchase_workflow_enabled: boolean;
  internal_order_workflow_enabled: boolean;
  stock_adjustment_workflow_enabled: boolean;
  allow_negative_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApprovalWorkflow = {
  id: number;
  uuid: string;
  tenant: number;
  clinic: number;
  document_type: DocumentType;
  name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApprovalWorkflowStep = {
  id: number;
  uuid: string;
  workflow: number;
  order: number;
  name: string;
  group_name: string | null;
  user_role: string | null;
  required_approvals: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApprovalRecord = {
  id: number;
  uuid: string;
  tenant: number;
  workflow: number;
  step: number;
  document_type: DocumentType;
  reference_model: string;
  reference_id: string;
  status: ApprovalStatus;
  acted_by: number | null;
  acted_at: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryLocationOption = {
  id: number;
  uuid: string;
  name: string;
  code: string;
  clinic: number;
  clinic_name?: string;
};

export type InventoryListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  tenant?: number;
  location?: number;
  odoo_product_id?: number;
  batch?: number;
  is_active?: boolean;
  status?: string;
  receiving_location?: number;
  source_location?: number;
  destination_location?: number;
  adjustment_type?: string;
  movement_type?: string;
  clinic?: number;
  document_type?: string;
  workflow?: number;
};

export type InventoryStockListResponse = PaginatedListResponse<InventoryStock>;
export type InventoryMovementListResponse = PaginatedListResponse<InventoryMovement>;
export type InventoryBatchListResponse = PaginatedListResponse<InventoryBatch>;
export type PurchaseOrderListResponse = PaginatedListResponse<PurchaseOrder>;
export type InternalOrderListResponse = PaginatedListResponse<InternalOrder>;
export type StockAdjustmentListResponse = PaginatedListResponse<StockAdjustment>;
export type InventoryClinicConfigurationListResponse =
  PaginatedListResponse<InventoryClinicConfiguration>;
export type ApprovalWorkflowListResponse = PaginatedListResponse<ApprovalWorkflow>;
export type ApprovalWorkflowStepListResponse = PaginatedListResponse<ApprovalWorkflowStep>;
export type ApprovalRecordListResponse = PaginatedListResponse<ApprovalRecord>;
