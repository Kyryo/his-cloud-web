import {
  Ban,
  CheckCircle2,
  FileText,
  History,
  Receipt,
  ShoppingCart,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DetailActivityTimelineItem } from "@/components/detail/detail-activity-timeline";
import type { BillingActivityRecord } from "@/features/billing/types/billing-activity.types";

const ACTION_ICONS: Record<string, LucideIcon> = {
  ORDER_ADDED: ShoppingCart,
  ORDER_CANCELLED: Ban,
  ORDER_CONFIRMED: CheckCircle2,
  ORDER_INVOICED: Receipt,
  ORDER_PROVIDER_UPDATED: UserRound,
  INVOICE_CREATED: FileText,
  PAYMENT_RECORDED: Wallet,
};

function formatActivitySummary(record: BillingActivityRecord): string {
  const details = record.details;
  const orderName = details.order_name ?? details.invoice_name ?? details.payment_name;
  if (typeof orderName === "string" && orderName.trim()) {
    return `${record.summary} (${orderName})`;
  }
  return record.summary;
}

export function mapBillingActivityItems(
  records: BillingActivityRecord[],
): DetailActivityTimelineItem[] {
  return records.map((record) => ({
    id: record.uuid || String(record.id),
    title: record.action_display || record.summary,
    summary: formatActivitySummary(record),
    occurredAt: record.occurred_at,
    icon: ACTION_ICONS[record.action] ?? History,
    createdByName: record.actor_name,
    createdByEmail: record.actor_email,
  }));
}
