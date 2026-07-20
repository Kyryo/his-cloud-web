export type DispensationQueueItem = {
  uuid: string;
  id: number;
  name: string;
  state: string;
  invoice_status: string;
  clinic_id: number | null;
  clinic_name: string;
  date_order: string;
  customer_id: number | null;
  customer_name: string;
  dispensable_line_count: number;
  remaining_line_count: number;
  remaining_quantity: string;
};

export type DispensationQueueLine = {
  id: number;
  uuid: string;
  product_id: number;
  product_uuid: string;
  product_name: string;
  quantity: string;
  dispensed_quantity: string;
  remaining_quantity: string;
};

export type DispensationQueueDetail = {
  uuid: string;
  id: number;
  name: string;
  state: string;
  invoice_status: string;
  clinic_id: number | null;
  clinic_name: string;
  date_order: string;
  customer_id: number;
  customer_name: string;
  lines: DispensationQueueLine[];
};

export type DispensationBatch = {
  id: number;
  uuid: string;
  batch: number;
  batch_number: string;
  quantity: string;
};

export type Dispensation = {
  id: number;
  uuid: string;
  sales_order: number;
  sales_order_name: string;
  sales_order_line: number;
  product: number;
  product_name: string | null;
  location: number;
  location_name: string;
  quantity: string;
  status: string;
  dispensed_by: number;
  dispensed_by_name: string | null;
  dispensed_at: string;
  notes: string;
  batches: DispensationBatch[];
};

export type DispensationConfiguration = {
  id: number;
  uuid: string;
  clinic: number;
  clinic_name: string;
  dispensation_start_state: string;
  require_sales_order_confirmation: boolean;
  invoice_after_dispensation: boolean;
};

export type DispensePayload = {
  sales_order_line: number;
  location: number;
  quantity: string | number;
  batches?: Array<{ batch: number; quantity: string | number }>;
  notes?: string;
};

export type DispenseBatchItemPayload = {
  sales_order_line: number;
  quantity: string | number;
  notes?: string;
};

export type DispenseBatchPayload = {
  location: number;
  items: DispenseBatchItemPayload[];
};

export type DispenseBatchResponse = {
  results: Dispensation[];
  count: number;
};

export type DispensationQueueListResponse = {
  results: DispensationQueueItem[];
  page: number;
  page_size: number;
  count: number | null;
};

export type DispensationListResponse = {
  results: Dispensation[];
  count?: number;
  next?: string | null;
  previous?: string | null;
};
