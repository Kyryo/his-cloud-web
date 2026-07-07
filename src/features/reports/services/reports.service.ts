import { BFF_REPORTS_ROUTES } from "@/constants/api";
import type {
  CreateReportJobPayload,
  ReportJob,
  ReportJobsListResponse,
  ReportTypesResponse,
} from "@/features/reports/types/report-job.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchReportTypes(): Promise<ReportTypesResponse> {
  return bffRequest<ReportTypesResponse>(BFF_REPORTS_ROUTES.types);
}

export async function fetchReportJobs(params?: {
  page?: number;
  reportType?: string;
  status?: string;
}): Promise<ReportJobsListResponse> {
  const search = new URLSearchParams();
  if (params?.page) {
    search.set("page", String(params.page));
  }
  if (params?.reportType) {
    search.set("report_type", params.reportType);
  }
  if (params?.status) {
    search.set("status", params.status);
  }
  const query = search.toString();
  return bffRequest<ReportJobsListResponse>(
    query ? `${BFF_REPORTS_ROUTES.list}?${query}` : BFF_REPORTS_ROUTES.list,
  );
}

export async function createReportJob(
  payload: CreateReportJobPayload,
): Promise<ReportJob> {
  return bffRequest<ReportJob>(BFF_REPORTS_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function fetchReportJob(uuid: string): Promise<ReportJob> {
  return bffRequest<ReportJob>(BFF_REPORTS_ROUTES.detail(uuid));
}

export async function cancelReportJob(uuid: string): Promise<ReportJob> {
  return bffRequest<ReportJob>(BFF_REPORTS_ROUTES.cancel(uuid), {
    method: "POST",
  });
}

export function reportDownloadUrl(uuid: string): string {
  return BFF_REPORTS_ROUTES.download(uuid);
}
