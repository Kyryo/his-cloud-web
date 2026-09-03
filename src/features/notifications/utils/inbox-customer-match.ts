import type { InboxItem } from "@/features/notifications/types/inbox.types";

export type InboxCustomerMatchInput = {
  id?: number | null;
  uuid?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function payloadString(
  payload: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

/**
 * Best-effort match of an inbox item to a customer.
 * Prefers payload ids when present; falls back to patient name fields.
 */
export function inboxItemMatchesCustomer(
  item: InboxItem,
  customer: InboxCustomerMatchInput,
): boolean {
  const payload = item.payload ?? {};

  const payloadCustomerId = payloadString(payload, [
    "customer_id",
    "customerId",
  ]);
  if (
    customer.id != null &&
    payloadCustomerId != null &&
    payloadCustomerId === String(customer.id)
  ) {
    return true;
  }

  const payloadCustomerUuid = payloadString(payload, [
    "customer_uuid",
    "customerUuid",
  ]);
  if (
    customer.uuid &&
    payloadCustomerUuid &&
    payloadCustomerUuid.toLowerCase() === customer.uuid.toLowerCase()
  ) {
    return true;
  }

  const fullName = normalizeName(customer.full_name);
  if (fullName) {
    if (normalizeName(item.preview_name) === fullName) {
      return true;
    }
    if (normalizeName(item.title).includes(fullName)) {
      return true;
    }
    if (normalizeName(item.body).includes(fullName)) {
      return true;
    }
  }

  const first = normalizeName(customer.first_name);
  const last = normalizeName(customer.last_name);
  if (first && last) {
    const composed = `${first} ${last}`;
    if (normalizeName(item.preview_name) === composed) {
      return true;
    }
    if (normalizeName(item.title).includes(composed)) {
      return true;
    }
  }

  return false;
}

export function filterInboxItemsForCustomer(
  items: InboxItem[],
  customer: InboxCustomerMatchInput,
): InboxItem[] {
  return items.filter((item) => inboxItemMatchesCustomer(item, customer));
}
