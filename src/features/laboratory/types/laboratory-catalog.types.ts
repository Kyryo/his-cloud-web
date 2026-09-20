export type LabCatalogPagination = {
  count: number;
  next: string | null;
  previous: string | null;
};

export type LabCatalogListResponse<T> = {
  results: T[];
  pagination: LabCatalogPagination | null;
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

export type LabSpecimenTypeWritePayload = {
  code?: string;
  name?: string;
  container?: string;
  volume?: string | number | null;
  volume_unit?: string;
  handling_notes?: string;
};

export type LabAnalyteValueType = "NUMERIC" | "TEXT" | "CODED";

export type LabAnalyteCodedOption = {
  code: string;
  label: string;
};

export type LabAnalyte = {
  uuid: string;
  code: string;
  name: string;
  loinc_code: string;
  value_type: LabAnalyteValueType | string;
  unit: string;
  decimal_precision: number | null;
  coded_options?: LabAnalyteCodedOption[];
  created_at: string;
  updated_at: string;
};

export type LabAnalyteWritePayload = {
  code?: string;
  name?: string;
  loinc_code?: string;
  value_type?: LabAnalyteValueType | string;
  unit?: string;
  decimal_precision?: number | null;
  coded_options?: LabAnalyteCodedOption[];
};

export type LabProductBrief = {
  uuid: string;
  name: string;
  default_code: string;
  lab_configuration?: "none" | "test" | "panel" | null;
};

export type LabUnconfiguredProduct = {
  uuid: string;
  name: string;
  default_code: string;
  display_name: string;
  lab_configuration: "none";
  lab_charge_type?: "individual" | "panel" | null;
};

export type LabTestAnalyteMembership = {
  uuid: string;
  analyte_uuid: string;
  analyte_code: string;
  analyte_name: string;
  value_type: string;
  unit: string;
  sort_order: number;
  is_required: boolean;
};

export type LabTestDefinition = {
  uuid: string;
  code: string;
  name: string;
  category: string;
  product: LabProductBrief | null;
  product_uuid: string | null;
  turnaround_hours: number | null;
  primary_specimen_type_uuid: string | null;
  primary_specimen_type_code: string | null;
  analytes: LabTestAnalyteMembership[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type LabTestActivityItem = {
  uuid: string;
  action: string;
  message: string;
  status: string;
  actor_name: string;
  actor_email: string;
  metadata: Record<string, unknown>;
  changes: Record<string, unknown>;
  source: string;
  occurred_at: string;
  created_at: string;
};

export type LabTestAnalyteWrite = {
  analyte_uuid: string;
  sort_order?: number;
  is_required?: boolean;
};

export type LabTestWritePayload = {
  code?: string;
  name?: string;
  category?: string;
  product_uuid?: string | null;
  turnaround_hours?: number | null;
  primary_specimen_type_uuid?: string | null;
  analytes?: LabTestAnalyteWrite[];
};

export type LabPanelTestMembership = {
  uuid: string;
  test_uuid: string;
  test_code: string;
  test_name: string;
  sort_order: number;
};

export type LabPanel = {
  uuid: string;
  code: string;
  name: string;
  product: LabProductBrief | null;
  product_uuid: string | null;
  tests: LabPanelTestMembership[];
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type LabPanelActivityItem = {
  uuid: string;
  action: string;
  message: string;
  status: string;
  actor_name: string;
  actor_email: string;
  metadata: Record<string, unknown>;
  changes: Record<string, unknown>;
  source: string;
  occurred_at: string;
  created_at: string;
};

export type LabPanelTestWrite = {
  test_uuid: string;
  sort_order?: number;
};

export type LabPanelWritePayload = {
  code?: string;
  name?: string;
  product_uuid?: string | null;
  tests?: LabPanelTestWrite[];
};

export type LabReferenceRangeSex = "M" | "F" | "ANY";

export type LabReferenceRange = {
  uuid: string;
  analyte_uuid: string;
  analyte_code: string;
  analyte_name: string;
  specimen_type_uuid: string | null;
  specimen_type_code: string | null;
  sex: LabReferenceRangeSex | string;
  age_min_days: number | null;
  age_max_days: number | null;
  low_normal: string | number | null;
  high_normal: string | number | null;
  low_critical: string | number | null;
  high_critical: string | number | null;
  effective_from: string;
  effective_to: string | null;
  text_normal: string;
  created_at: string;
  updated_at: string;
};

export type LabReferenceRangeWritePayload = {
  analyte_uuid?: string;
  specimen_type_uuid?: string | null;
  sex?: LabReferenceRangeSex | string;
  age_min_days?: number | null;
  age_max_days?: number | null;
  low_normal?: string | number | null;
  high_normal?: string | number | null;
  low_critical?: string | number | null;
  high_critical?: string | number | null;
  effective_from?: string;
  effective_to?: string | null;
  text_normal?: string;
};

export type LabTenantSettings = {
  uuid: string;
  auto_accession_on_collect: boolean;
  require_verify_before_release: boolean;
  critical_notify_enabled: boolean;
  default_department_uuid: string | null;
  default_department_name: string | null;
  report_footer: string;
  report_letterhead: string;
  analyzer_ingest_enabled: boolean;
  analyzer_shared_secret_configured: boolean;
  accession_sequence: number;
  updated_at: string;
};

export type LabTenantSettingsWritePayload = {
  auto_accession_on_collect?: boolean;
  require_verify_before_release?: boolean;
  critical_notify_enabled?: boolean;
  default_department_uuid?: string | null;
  report_footer?: string;
  report_letterhead?: string;
  analyzer_ingest_enabled?: boolean;
  analyzer_shared_secret_hash?: string;
};
