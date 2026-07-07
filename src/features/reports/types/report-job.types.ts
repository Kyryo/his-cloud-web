export type ReportJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type ReportFileFormat = "csv" | "xlsx";

export type ReportJob = {
  uuid: string;
  report_type: string;
  file_format: ReportFileFormat;
  filters: Record<string, unknown>;
  status: ReportJobStatus;
  output_filename: string;
  content_type: string;
  checksum_sha256: string;
  row_count: number;
  file_size: number;
  failure_code: string;
  failure_message: string;
  requested_by_email: string;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  downloadable: boolean;
};

export type ReportTypeOption = {
  value: string;
  label: string;
};

export type ReportTypesResponse = {
  report_types: ReportTypeOption[];
  file_formats: ReportTypeOption[];
};

export type CreateReportJobPayload = {
  report_type: string;
  file_format: ReportFileFormat;
  filters?: Record<string, unknown>;
};

export type ReportJobsListResponse = {
  results: ReportJob[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};
