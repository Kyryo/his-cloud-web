import { BFF_CUSTOMERS_ROUTES } from "@/constants/api";
import type { Tag } from "@/features/tags/types/tag.types";
import { bffRequest } from "@/lib/bff-client";

export async function syncCustomerTags(
  customerUuid: string,
  tagUuids: string[],
): Promise<Tag[]> {
  return bffRequest<Tag[]>(BFF_CUSTOMERS_ROUTES.tags(customerUuid), {
    method: "PUT",
    body: { tag_uuids: tagUuids },
  });
}
