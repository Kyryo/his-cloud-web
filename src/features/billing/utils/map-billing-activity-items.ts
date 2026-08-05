import {
  Activity,
  Ban,
  CheckCircle2,
  FileText,
  History,
  Receipt,
  ShieldAlert,
  ShoppingCart,
  Stethoscope,
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
  ORDER_REOPENED: ShoppingCart,
  ORDER_PROVIDER_UPDATED: UserRound,
  ORDER_PAYMENT_SPLIT_UPDATED: Wallet,
  ORDER_LINE_ADDED: ShoppingCart,
  ORDER_LINE_UPDATED: ShoppingCart,
  ORDER_LINE_REMOVED: Ban,
  INVOICE_CREATED: FileText,
  INVOICE_UPDATED: FileText,
  INVOICE_CANCELLED: Ban,
  PAYMENT_RECORDED: Wallet,
  PAYMENT_UPDATED: Wallet,
  PAYMENT_CANCELLED: Ban,
  CLAIM_CREATED: FileText,
  CLAIM_SUBMITTED: CheckCircle2,
  CLAIM_UPDATED: FileText,
  CLAIM_VITALS_UPDATED: Activity,
  CLAIM_DIAGNOSIS_ADDED: Stethoscope,
  CLAIM_DIAGNOSES_SYNCED: Stethoscope,
  CLAIM_ADVISORIES_EVALUATED: ShieldAlert,
  CLAIM_ADVISORY_OVERRIDE: ShieldAlert,
};

function formatActivitySummary(record: BillingActivityRecord): string {
  const details = record.details;
  const claimCode =
    typeof details.code === "string" && details.code.trim() ? details.code : null;
  if (record.action === "CLAIM_DIAGNOSIS_ADDED" && claimCode) {
    return `${record.summary} (${claimCode})`;
  }
  const orderName = details.order_name ?? details.invoice_name ?? details.payment_name;
  if (typeof orderName === "string" && orderName.trim()) {
    return `${record.summary} (${orderName})`;
  }
  if (typeof details.claim_id === "number" || typeof details.claim_id === "string") {
    return `${record.summary} (claim #${details.claim_id})`;
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
