import { BFF_TAGS_ROUTES } from "@/constants/api";
import type {
  CreateTagPayload,
  Tag,
  TagListFilters,
  TagsListResponse,
  UpdateTagPayload,
} from "@/features/tags/types/tag.types";
import { bffRequest } from "@/lib/bff-client";

function buildTagsQuery(filters: TagListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.target_type) {
    params.set("target_type", filters.target_type);
  }
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.is_active !== undefined) {
    params.set("is_active", String(filters.is_active));
  }
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.ordering) {
    params.set("ordering", filters.ordering);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchTags(
  filters: TagListFilters = {},
): Promise<TagsListResponse> {
  return bffRequest<TagsListResponse>(
    `${BFF_TAGS_ROUTES.list}${buildTagsQuery(filters)}`,
  );
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  return bffRequest<Tag>(BFF_TAGS_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateTag(
  uuid: string,
  payload: UpdateTagPayload,
): Promise<Tag> {
  return bffRequest<Tag>(BFF_TAGS_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

export async function archiveTag(uuid: string): Promise<void> {
  await bffRequest<null>(BFF_TAGS_ROUTES.detail(uuid), {
    method: "DELETE",
  });
}
