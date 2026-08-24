import { BFF_CLAIMS_ROUTES } from "@/constants/api";
import type {
  RemittanceBatch,
  RemittanceBatchDetail,
  RemittanceBatchListResponse,
  RemittanceRow,
  RemittanceRowListResponse,
} from "@/features/claims/types/remittances.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchRemittanceBatches(filters: {
  page?: number;
  pageSize?: number;
  status?: string;
} = {}): Promise<RemittanceBatchListResponse> {
  const params = new URLSearchParams();
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  const query = params.toString();
  return bffRequest<RemittanceBatchListResponse>(
    `${BFF_CLAIMS_ROUTES.remittances}${query ? `?${query}` : ""}`,
  );
}

export async function fetchRemittanceBatch(
  batchId: number | string,
): Promise<RemittanceBatchDetail> {
  return bffRequest<RemittanceBatchDetail>(
    BFF_CLAIMS_ROUTES.remittanceDetail(batchId),
  );
}

export async function deleteRemittanceBatch(
  batchId: number | string,
): Promise<void> {
  await bffRequest<null>(BFF_CLAIMS_ROUTES.remittanceDetail(batchId), {
    method: "DELETE",
  });
}

export async function renameRemittanceBatch(
  batchId: number | string,
  displayFilename: string,
): Promise<RemittanceBatchDetail> {
  return bffRequest<RemittanceBatchDetail>(
    BFF_CLAIMS_ROUTES.remittanceRename(batchId),
    {
      method: "POST",
      body: { display_filename: displayFilename },
    },
  );
}

export async function fetchRemittanceRows(
  batchId: number | string,
  filters: { page?: number; pageSize?: number; search?: string } = {},
): Promise<RemittanceRowListResponse> {
  const params = new URLSearchParams();
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  const query = params.toString();
  return bffRequest<RemittanceRowListResponse>(
    `${BFF_CLAIMS_ROUTES.remittanceRows(batchId)}${query ? `?${query}` : ""}`,
  );
}

export async function uploadRemittanceBatch(payload: {
  file: File;
  payerCode?: string;
  layoutProfile?: string;
}): Promise<RemittanceBatch> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("payer_code", payload.payerCode ?? "MASM");
  if (payload.layoutProfile) {
    formData.append("layout_profile", payload.layoutProfile);
  }
  return bffRequest<RemittanceBatch>(BFF_CLAIMS_ROUTES.remittances, {
    method: "POST",
    body: formData,
  });
}

export async function matchRemittanceRow(
  batchId: number | string,
  rowId: number | string,
  claimId: number,
): Promise<RemittanceRow> {
  return bffRequest<RemittanceRow>(
    BFF_CLAIMS_ROUTES.remittanceRowMatch(batchId, rowId),
    {
      method: "POST",
      body: { claim_id: claimId },
    },
  );
}

export async function applyRemittanceRow(
  batchId: number | string,
  rowId: number | string,
): Promise<{ row: RemittanceRow }> {
  return bffRequest<{ row: RemittanceRow }>(
    BFF_CLAIMS_ROUTES.remittanceRowApply(batchId, rowId),
    { method: "POST" },
  );
}

export async function rejectRemittanceRow(
  batchId: number | string,
  rowId: number | string,
): Promise<RemittanceRow> {
  return bffRequest<RemittanceRow>(
    BFF_CLAIMS_ROUTES.remittanceRowReject(batchId, rowId),
    { method: "POST" },
  );
}
