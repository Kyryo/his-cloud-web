import { REPORTS_API_PATHS } from "@/constants/reports-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { hmisApiBinaryRequest } from "@/lib/server/hmis-api-binary";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { NextResponse } from "next/server";

const FORWARDED_LIST_KEYS = ["page", "page_size", "report_type", "status"] as const;

function buildListQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of FORWARDED_LIST_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const query = buildListQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<unknown[]>(
      `${REPORTS_API_PATHS.list}${query}`,
      { token: auth.accessToken },
    );
    return bffSuccess({ results: data, pagination: meta.pagination ?? null });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const body = await request.json();
    const data = await hmisApiRequest<unknown>(REPORTS_API_PATHS.list, {
      method: "POST",
      body,
      token: auth.accessToken,
    });
    return bffSuccess(data, 202);
  } catch (error) {
    return bffError(error);
  }
}

export async function downloadReport(uuid: string, token: string) {
  const file = await hmisApiBinaryRequest(REPORTS_API_PATHS.download(uuid), {
    token,
  });
  return new NextResponse(file.body, {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
}
