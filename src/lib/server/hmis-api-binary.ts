import { HMIS_API_URL } from "@/constants/api";
import { createRequestId } from "@/lib/request-id";
import { HmisApiError } from "@/lib/server/hmis-api";

type BinaryRequestOptions = {
  token?: string;
};

export type HmisBinaryResponse = {
  body: ArrayBuffer;
  contentType: string;
  filename: string;
};

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function parseFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return "report.csv";
  }
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  return match?.[1] ?? "report.csv";
}

export async function hmisApiBinaryRequest(
  path: string,
  options: BinaryRequestOptions = {},
): Promise<HmisBinaryResponse> {
  if (!HMIS_API_URL) {
    throw new HmisApiError("HMIS_API_URL is not configured on the server.");
  }

  const { token } = options;
  const requestId = createRequestId();
  const response = await fetch(`${HMIS_API_URL}${normalizePath(path)}`, {
    method: "GET",
    headers: {
      accept: "*/*",
      "X-Request-ID": requestId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new HmisApiError("Report download failed.", response.status);
  }

  return {
    body: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "text/csv",
    filename: parseFilename(response.headers.get("content-disposition")),
  };
}
