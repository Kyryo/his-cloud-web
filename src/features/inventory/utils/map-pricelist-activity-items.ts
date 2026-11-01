import {
  CheckCircle2,
  Copy,
  History,
  Pencil,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ActivityIconTone } from "@/components/detail/detail-activity-timeline-utils";
import type { ActivityFeedItem } from "@/components/feed/activity-feed";
import type { CatalogAuditEvent } from "@/features/catalog/types/catalog.types";

const ACTION_ICONS: Record<string, LucideIcon> = {
  "catalog.pricelist.created": Plus,
  "catalog.pricelist.updated": Pencil,
  "catalog.pricelist.deleted": Trash2,
  "catalog.pricelist.price_change_requested": Pencil,
  "catalog.pricelist.price_change_applied": CheckCircle2,
  "catalog.pricelist.price_change_confirmed": CheckCircle2,
  "catalog.pricelist.price_change_rejected": ShieldAlert,
  "catalog.pricelist.copy_requested": Copy,
  "catalog.pricelist.copy_completed": Copy,
  "catalog.pricelist.masm_core_sync_queued": RefreshCw,
  "catalog.pricelist.masm_core_prices_synced": RefreshCw,
  "catalog.pricelist.masm_core_sync_failed": ShieldAlert,
  "catalog.pricelist.rule_created": Plus,
  "catalog.pricelist.rule_updated": Pencil,
  "catalog.pricelist.rule_deleted": Trash2,
};

const ACTION_TONES: Record<string, ActivityIconTone> = {
  "catalog.pricelist.created": "success",
  "catalog.pricelist.updated": "info",
  "catalog.pricelist.deleted": "danger",
  "catalog.pricelist.price_change_requested": "warning",
  "catalog.pricelist.price_change_applied": "success",
  "catalog.pricelist.price_change_confirmed": "success",
  "catalog.pricelist.price_change_rejected": "danger",
  "catalog.pricelist.copy_requested": "info",
  "catalog.pricelist.copy_completed": "success",
  "catalog.pricelist.masm_core_sync_queued": "info",
  "catalog.pricelist.masm_core_prices_synced": "success",
  "catalog.pricelist.masm_core_sync_failed": "danger",
  "catalog.pricelist.rule_created": "success",
  "catalog.pricelist.rule_updated": "info",
  "catalog.pricelist.rule_deleted": "danger",
};

const ACTION_TITLES: Record<string, string> = {
  "catalog.pricelist.created": "Pricelist created",
  "catalog.pricelist.updated": "Pricelist updated",
  "catalog.pricelist.deleted": "Pricelist deleted",
  "catalog.pricelist.price_change_requested": "Price change requested",
  "catalog.pricelist.price_change_applied": "Price change applied",
  "catalog.pricelist.price_change_confirmed": "Price change confirmed",
  "catalog.pricelist.price_change_rejected": "Price change rejected",
  "catalog.pricelist.copy_requested": "Product copy started",
  "catalog.pricelist.copy_completed": "Product copy completed",
  "catalog.pricelist.masm_core_sync_queued": "MASM Core sync queued",
  "catalog.pricelist.masm_core_prices_synced": "MASM Core prices synced",
  "catalog.pricelist.masm_core_sync_failed": "MASM Core sync failed",
  "catalog.pricelist.rule_created": "Rule created",
  "catalog.pricelist.rule_updated": "Rule updated",
  "catalog.pricelist.rule_deleted": "Rule deleted",
};

function titleForAction(action: string): string {
  if (ACTION_TITLES[action]) {
    return ACTION_TITLES[action];
  }
  const suffix = action.split(".").pop() || action;
  return suffix.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function mapPricelistActivityItems(
  events: CatalogAuditEvent[],
): ActivityFeedItem[] {
  return events.map((event) => ({
    id: event.uuid,
    title: titleForAction(event.action),
    summary: event.message || "",
    occurredAt: event.created_at,
    icon: ACTION_ICONS[event.action] ?? History,
    tone: ACTION_TONES[event.action] ?? "neutral",
    groupKey: event.action,
    createdByName: event.actor_name || undefined,
    createdByEmail: event.actor_email || undefined,
  }));
}
