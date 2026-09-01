import { NextResponse } from "next/server";

import { TAGS_API_PATHS } from "@/constants/tags-api";
import type { CreateTagPayload, Tag } from "@/features/tags/types/tag.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = [
  "target_type",
  "page",
  "page_size",
  "search",
  "is_active",
  "ordering",
] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
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

    const query = buildUpstreamQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<Tag[]>(
      `${TAGS_API_PATHS.list}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as CreateTagPayload;
    if (!body.name?.trim() || !body.target_type?.trim()) {
      return NextResponse.json(
        { message: "Name and target type are required." },
        { status: 400 },
      );
    }

    const tag = await hmisApiRequest<Tag>(TAGS_API_PATHS.list, {
      method: "POST",
      token: admin.accessToken,
      body,
    });

    return bffSuccess(tag, 201);
  } catch (error) {
    return bffError(error);
  }
}
