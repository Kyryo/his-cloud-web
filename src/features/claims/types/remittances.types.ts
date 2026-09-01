export type RemittanceBatchStatus =
  | "queued"
  | "processing"
  | "processed"
  | "failed"
  | "needs_review";

export type RemittanceRowResolutionStatus =
  | "pending_match"
  | "unmatched"
  | "pending_review"
  | "auto_applied"
  | "manually_resolved"
  | "rejected";

export type RemittanceBatchSummary = {
  row_count?: number;
  sum_pay_to_provider?: string | null;
  document_total_pay_to_provider?: string | null;
  matched?: number;
  unmatched?: number;
  pending_review?: number;
  auto_applied?: number;
  gate_failures?: Array<Record<string, unknown>>;
};

export type RemittanceBatch = {
  id: number;
  uuid: string;
  payer_code: string;
  original_filename: string;
  display_filename: string;
  file_format: string;
  checksum_sha256: string;
  parser_key: string;
  layout_profile: string;
  document_number: string;
  payment_run_date: string | null;
  provider_name: string;
  status: RemittanceBatchStatus;
  error_message: string;
  parse_report: Record<string, unknown>;
  summary: RemittanceBatchSummary;
  created_at: string;
  updated_at: string;
};

export type RemittanceRow = {
  id: number;
  uuid: string;
  source_row_number: number;
  member_number: string;
  member_name: string;
  patient_name: string;
  service_date: string | null;
  invoice_number: string;
  payer_claim_number: string;
  procedure_code: string;
  quantity: string | null;
  amount_claimed: string | null;
  cover_percent: string | null;
  shortfall_amount: string | null;
  accepted_amount: string | null;
  excess_previously_paid: string | null;
  pay_to_provider: string | null;
  pay_to_member: string | null;
  tax_amount: string | null;
  reason_code: string;
  remarks: string;
  parse_warnings: string[];
  matched_claim_id: number | null;
  matched_claim_uuid: string | null;
  matched_invoice_id: number | null;
  matched_invoice_uuid: string | null;
  matched_line_item_id: number | null;
  confidence: string | null;
  match_reasons: string[];
  resolution_status: RemittanceRowResolutionStatus;
};

/** Batch header payload (rows are loaded via the paginated rows endpoint). */
export type RemittanceBatchDetail = RemittanceBatch;

export type RemittanceListPagination = {
  count: number;
  page?: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
} | null;

export type RemittanceListFilters = {
  page?: number;
  pageSize?: number;
  status?: RemittanceBatchStatus;
  search?: string;
};

export type RemittanceBatchListResponse = {
  results: RemittanceBatch[];
  pagination: RemittanceListPagination;
};

export type RemittanceSummaryStatsBucket = {
  count: number;
  total: string;
};

export type RemittanceSummaryStats = {
  all: RemittanceSummaryStatsBucket;
  in_progress: RemittanceSummaryStatsBucket;
  processed: RemittanceSummaryStatsBucket;
  needs_review: RemittanceSummaryStatsBucket;
};

export type RemittanceRowListResponse = {
  results: RemittanceRow[];
  pagination: RemittanceListPagination;
};

export type RemittanceBatchRowStatsBucket = {
  count: number;
  total: string;
};

export type RemittanceBatchRowSummaryStats = {
  claimed: RemittanceBatchRowStatsBucket;
  pay_to_provider: RemittanceBatchRowStatsBucket;
  matched: RemittanceBatchRowStatsBucket;
  needs_action: RemittanceBatchRowStatsBucket;
};

export type RemittanceRejectionRow = RemittanceRow & {
  batch_id: number;
  batch_uuid: string;
  batch_display_filename: string;
  batch_payer_code: string;
};

export type RemittanceRejectionSummaryStats = {
  claimed: RemittanceBatchRowStatsBucket;
  pay_to_provider: RemittanceBatchRowStatsBucket;
  matched: RemittanceBatchRowStatsBucket;
  with_reason: RemittanceBatchRowStatsBucket;
};

export type RemittanceRejectionListFilters = {
  page?: number;
  pageSize?: number;
  payerCode?: string;
  search?: string;
};

export type RemittanceRejectionListResponse = {
  results: RemittanceRejectionRow[];
  pagination: RemittanceListPagination;
};
