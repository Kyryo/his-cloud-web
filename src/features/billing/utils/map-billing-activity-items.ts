import {
  Activity,
  Ban,
  CheckCircle2,
  CircleCheck,
  FileText,
  History,
  Receipt,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  ActivityIconTone,
  DetailActivityTimelineItem,
} from "@/components/detail/detail-activity-timeline-utils";
import type { BillingActivityRecord } from "@/features/billing/types/billing-activity.types";

const ACTION_ICONS: Record<string, LucideIcon> = {
  ORDER_ADDED: ShoppingCart,
  ORDER_CANCELLED: Ban,
  ORDER_CONFIRMED: CheckCircle2,
  ORDER_INVOICED: Receipt,
  ORDER_REOPENED: ShoppingCart,
  ORDER_PROVIDER_UPDATED: UserRound,
  ORDER_PAYMENT_SPLIT_UPDATED: Wallet,
  ORDER_PRICES_RECALCULATED: RefreshCw,
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
  CLAIM_SUBMITTED: Send,
  CLAIM_UPDATED: FileText,
  CLAIM_VITALS_UPDATED: Activity,
  CLAIM_DIAGNOSIS_ADDED: Stethoscope,
  CLAIM_DIAGNOSES_SYNCED: Stethoscope,
  CLAIM_ADVISORIES_EVALUATED: ShieldCheck,
  CLAIM_ADVISORY_OVERRIDE: ShieldAlert,
  CLAIM_ADVISORY_CLEARED: CircleCheck,
  CLAIM_ADVISORY_APPLIED: CheckCircle2,
  CLAIM_PAYER_WEBHOOK_RECEIVED: Send,
};

const ACTION_TONES: Record<string, ActivityIconTone> = {
  ORDER_ADDED: "info",
  ORDER_CANCELLED: "danger",
  ORDER_CONFIRMED: "success",
  ORDER_INVOICED: "info",
  ORDER_REOPENED: "warning",
  ORDER_LINE_ADDED: "info",
  ORDER_LINE_REMOVED: "danger",
  INVOICE_CREATED: "info",
  INVOICE_CANCELLED: "danger",
  PAYMENT_RECORDED: "success",
  PAYMENT_CANCELLED: "danger",
  CLAIM_CREATED: "info",
  CLAIM_SUBMITTED: "info",
  CLAIM_ADVISORIES_EVALUATED: "warning",
  CLAIM_ADVISORY_OVERRIDE: "warning",
  CLAIM_ADVISORY_CLEARED: "success",
  CLAIM_ADVISORY_APPLIED: "success",
};

function formatActivitySummary(record: BillingActivityRecord): string {
  const details = record.details;
  const claimId =
    typeof details.claim_id === "number" || typeof details.claim_id === "string"
      ? String(details.claim_id)
      : null;
  const claimCode =
    typeof details.code === "string" && details.code.trim() ? details.code : null;
  const payer =
    typeof details.payer_code === "string" && details.payer_code.trim()
      ? details.payer_code.trim()
      : null;

  if (record.action === "CLAIM_CREATED") {
    return [
      claimId ? `Claim #${claimId} was created as a draft` : "A claim draft was created",
      payer ? `payer ${payer}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (record.action === "CLAIM_SUBMITTED") {
    return [
      claimId ? `Claim #${claimId} was submitted` : "The claim was submitted",
      payer ? `to ${payer}` : "to the payer",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (record.action === "CLAIM_DIAGNOSIS_ADDED" && claimCode) {
    return `${record.summary} (${claimCode})`;
  }
  const orderName = details.order_name ?? details.invoice_name ?? details.payment_name;
  if (typeof orderName === "string" && orderName.trim()) {
    return `${record.summary} (${orderName})`;
  }
  if (claimId) {
    return `${record.summary} (claim #${claimId})`;
  }
  return record.summary;
}

function formatActivityTitle(record: BillingActivityRecord): string {
  const details = record.details;
  const claimId =
    typeof details.claim_id === "number" || typeof details.claim_id === "string"
      ? String(details.claim_id)
      : null;

  switch (record.action) {
    case "CLAIM_CREATED":
      return claimId
        ? `Insurance claim created (#${claimId})`
        : "Insurance claim created";
    case "CLAIM_SUBMITTED":
      return claimId
        ? `Insurance claim submitted (#${claimId})`
        : "Insurance claim submitted";
    case "CLAIM_ADVISORIES_EVALUATED":
      return claimId
        ? `Claim advisories evaluated (#${claimId})`
        : "Claim advisories evaluated";
    case "ORDER_ADDED":
      return "Sales order created";
    case "ORDER_CONFIRMED":
      return "Sales order confirmed";
    case "ORDER_INVOICED":
      return "Sales order invoiced";
    case "INVOICE_CREATED":
      return "Invoice created";
    case "PAYMENT_RECORDED":
      return "Payment recorded";
    default:
      return record.action_display || record.summary;
  }
}

export function mapBillingActivityItems(
  records: BillingActivityRecord[],
): DetailActivityTimelineItem[] {
  return records.map((record) => ({
    id: record.uuid || String(record.id),
    title: formatActivityTitle(record),
    summary: formatActivitySummary(record),
    occurredAt: record.occurred_at,
    icon: ACTION_ICONS[record.action] ?? History,
    tone: ACTION_TONES[record.action] ?? "neutral",
    groupKey: record.action,
    createdByName: record.actor_name,
    createdByEmail: record.actor_email,
  }));
}
