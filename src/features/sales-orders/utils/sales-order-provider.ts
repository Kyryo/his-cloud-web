import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
import type {
  SalesOrder,
  SalesOrderProviderAssociation,
} from "@/features/sales-orders/types/sales-order.types";

export function getSalesOrderProviders(
  order: SalesOrder,
): SalesOrderProviderAssociation[] {
  if (order.providers && order.providers.length > 0) {
    return order.providers;
  }
  if (order.provider_id && order.provider_name) {
    return [
      {
        id: order.provider_id,
        name: order.provider_name,
        user_id: order.provider_user_id ?? null,
        has_user: Boolean(order.provider_has_user),
        is_primary: true,
      },
    ];
  }
  return [];
}

export function formatSalesOrderProvidersLabel(order: SalesOrder): string {
  const providers = getSalesOrderProviders(order);
  if (providers.length === 0) {
    return "Unassigned";
  }
  const primary =
    providers.find((provider) => provider.is_primary) ?? providers[0];
  const extras = providers.length - 1;
  if (extras <= 0) {
    return primary.name;
  }
  return `${primary.name} +${extras}`;
}

export function toSalesOrderProviderRecord(
  order: SalesOrder,
): CareProviderRecord | null {
  const providers = getSalesOrderProviders(order);
  const primary =
    providers.find((provider) => provider.is_primary) ?? providers[0];
  if (!primary) {
    return null;
  }

  return associationToCareProviderRecord(primary);
}

export function associationToCareProviderRecord(
  provider: SalesOrderProviderAssociation,
): CareProviderRecord {
  return {
    id: provider.id,
    uuid: "",
    provider_id: provider.id,
    display_name: provider.name,
    is_active: true,
    provider_has_user: Boolean(provider.has_user),
    provider_user_id: provider.user_id ?? null,
    user_id: provider.user_id ?? null,
    user_email: null,
    user_role: null,
    clinic_ids: [],
    created_at: "",
    updated_at: "",
  };
}
