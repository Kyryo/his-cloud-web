export type LabOrderStatus =
  | "ORDERED"
  | "COLLECTING"
  | "IN_LAB"
  | "PARTIAL"
  | "COMPLETED"
  | "CANCELLED";

export type LabOrderPriority = "ROUTINE" | "URGENT" | "STAT";

export type LabOrderItemStatus =
  | "ORDERED"
  | "SPECIMEN_PENDING"
  | "IN_PROGRESS"
  | "RESULTED"
  | "RELEASED"
  | "CANCELLED";

export type LabSpecimenStatus = "COLLECTED" | "REJECTED" | "ACCESSIONED";

export type LabResultStatus =
  | "DRAFT"
  | "ENTERED"
  | "VERIFIED"
  | "RELEASED"
  | "REJECTED";

export type LabOrderItem = {
  uuid: string;
  test_uuid: string;
  test_code: string;
  test_name: string;
  visit_order_uuid?: string | null;
  panel_uuid: string | null;
  panel_code: string | null;
  status: LabOrderItemStatus | string;
  sort_order: number;
  result_status: LabResultStatus | string | null;
};

export type LabOrderedProduct = {
  visit_order_uuid: string | null;
  product_uuid: string | null;
  product_name: string;
  product_code: string;
  panel_uuid: string | null;
  panel_code: string | null;
  status: LabOrderItemStatus | string;
  item_count: number;
};

export type LabOrder = {
  uuid: string;
  status: LabOrderStatus | string;
  priority: LabOrderPriority | string;
  clinical_notes: string;
  ordered_at: string;
  cancelled_at: string | null;
  clinic_uuid: string;
  clinic_name: string;
  department_uuid: string | null;
  visit_uuid: string;
  encounter_uuid: string;
  customer_uuid: string;
  customer_name?: string | null;
  customer_identifier?: string | null;
  customer_gender?: string | null;
  customer_dob?: string | null;
  visit_order_uuid: string;
  ordered_by_name: string | null;
  accession_number: string | null;
  items: LabOrderItem[];
  ordered_products?: LabOrderedProduct[];
  specimens?: LabSpecimen[];
  created_at: string;
  updated_at: string;
};

export type LabSpecimen = {
  uuid: string;
  lab_order_uuid: string;
  specimen_type_uuid: string;
  specimen_type_code: string;
  specimen_type_name: string;
  status: LabSpecimenStatus | string;
  collected_at: string;
  collected_by_name: string | null;
  condition: string;
  barcode: string;
  accession_number: string | null;
  rejection_reason: string;
  rejected_at: string | null;
  order_item_uuids: string[];
};

export type LabAccession = {
  uuid: string;
  accession_number: string;
  lab_order_uuid: string;
  accessioned_at: string;
  accessioned_by_name: string | null;
};

export type LabResultAnalyte = {
  uuid: string;
  analyte_uuid: string;
  analyte_code: string;
  analyte_name: string;
  value_type?: string | null;
  decimal_precision?: number | null;
  value_text: string;
  value_numeric: string | number | null;
  unit: string;
  flag: string;
  source: string;
  ref_low: string | number | null;
  ref_high: string | number | null;
  ref_low_critical: string | number | null;
  ref_high_critical: string | number | null;
  observed_at: string | null;
};

export type LabResult = {
  uuid: string;
  order_item_uuid: string;
  status: LabResultStatus | string;
  entered_at: string | null;
  entered_by_name: string | null;
  verified_at: string | null;
  verified_by_name: string | null;
  released_at: string | null;
  released_by_name: string | null;
  rejected_at: string | null;
  analytes: LabResultAnalyte[];
};

export type LabSpecimenType = {
  uuid: string;
  code: string;
  name: string;
  container: string;
  volume: string | number | null;
  volume_unit: string;
  handling_notes: string;
  created_at: string;
  updated_at: string;
};

export type LabReportItem = {
  uuid: string;
  test_code: string;
  test_name: string;
  panel_code: string | null;
  status: string;
  result_status: string | null;
  analytes: Array<{
    analyte_code: string;
    analyte_name: string;
    value_text: string;
    value_numeric: string | null;
    unit: string;
    flag: string;
    ref_low: string | null;
    ref_high: string | null;
  }>;
};

export type LabReport = {
  order_uuid: string;
  status: string;
  priority: string;
  ordered_at: string | null;
  clinical_notes: string;
  patient: { uuid: string | null; name: string };
  clinic: { uuid: string | null; name: string };
  letterhead: string;
  footer: string;
  generated_at: string;
  items: LabReportItem[];
};

export type LabOrdersPagination = {
  count: number;
  next: string | null;
  previous: string | null;
};

export type LabOrdersListResponse = {
  results: LabOrder[];
  pagination: LabOrdersPagination | null;
};

export type LabOrderListFilters = {
  page?: number;
  pageSize?: number;
  status?: LabOrderStatus | "all";
  priority?: LabOrderPriority | "all";
  clinic?: string;
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
  accession?: string;
};

export type CollectSpecimenPayload = {
  specimen_type_uuid: string;
  order_item_uuids: string[];
  condition?: string;
  barcode?: string | null;
};

export type AccessionOrderPayload = {
  specimen_uuids?: string[] | null;
};

export type UpsertLabResultPayload = {
  values: Array<{
    analyte_uuid: string;
    value_text?: string;
    value_numeric?: string | number | null;
  }>;
};

export type RejectLabResultPayload = {
  reason: string;
};

export type RejectSpecimenPayload = {
  reason: string;
};
