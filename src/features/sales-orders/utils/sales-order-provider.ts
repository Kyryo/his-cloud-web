import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

export function toSalesOrderProviderRecord(
  order: SalesOrder,
): CareProviderRecord | null {
  if (!order.provider_id || !order.provider_name) {
    return null;
  }

  return {
    id: order.provider_id,
    uuid: "",
    provider_id: order.provider_id,
    display_name: order.provider_name,
    is_active: true,
    provider_has_user: Boolean(order.provider_has_user),
    provider_user_id: order.provider_user_id ?? null,
    user_id: order.provider_user_id ?? null,
    user_email: null,
    user_role: null,
    clinic_ids: [],
    created_at: "",
    updated_at: "",
  };
}
