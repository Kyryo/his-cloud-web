"use client";

import { useMemo } from "react";

import type { ClinicalReferralItem } from "@/features/clinical-opd/types/clinical-opd.types";

const CATEGORY_ORDER = [
  "LABORATORY",
  "RADIOLOGY",
  "PROCEDURE",
  "MEDICATION",
  "TREATMENT",
  "SUPPLY",
  "CONSULTATION",
  "SUNDRY",
  "OTHER",
] as const;

type StartReferralOrdersPanelProps = {
  items: ClinicalReferralItem[];
  serviceTypeFallback?: string;
};

function resolveItemType(
  item: ClinicalReferralItem,
  serviceTypeFallback?: string,
): string {
  const raw = (item.item_type || serviceTypeFallback || "OTHER").trim();
  return raw ? raw.toUpperCase() : "OTHER";
}

function categoryLabel(itemType: string, display?: string): string {
  if (display?.trim()) {
    return display.trim();
  }
  return itemType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function categorySortKey(itemType: string): number {
  const index = CATEGORY_ORDER.indexOf(
    itemType as (typeof CATEGORY_ORDER)[number],
  );
  return index === -1 ? CATEGORY_ORDER.length : index;
}

export function StartReferralOrdersPanel({
  items,
  serviceTypeFallback,
}: StartReferralOrdersPanelProps) {
  const groups = useMemo(() => {
    const byType = new Map<
      string,
      { label: string; items: ClinicalReferralItem[] }
    >();

    for (const item of items) {
      const itemType = resolveItemType(item, serviceTypeFallback);
      const existing = byType.get(itemType);
      if (existing) {
        existing.items.push(item);
        continue;
      }
      byType.set(itemType, {
        label: categoryLabel(itemType, item.item_type_display),
        items: [item],
      });
    }

    return [...byType.entries()]
      .sort(([a], [b]) => categorySortKey(a) - categorySortKey(b))
      .map(([itemType, group]) => ({ itemType, ...group }));
  }, [items, serviceTypeFallback]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-dash-border px-4 py-10 text-center">
        <p className="text-sm font-medium text-brand-navy">No orders on this referral</p>
        <p className="mt-1 text-sm text-dash-muted">
          Referred services will appear here before intake.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="start-referral-orders-panel">
      {groups.map((group) => (
        <section key={group.itemType} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-brand-navy">{group.label}</h3>
            <span className="text-xs tabular-nums text-dash-muted">
              {group.items.length}{" "}
              {group.items.length === 1 ? "order" : "orders"}
            </span>
          </div>
          <ul className="divide-y divide-dash-border/70 border-y border-dash-border/70">
            {group.items.map((item) => {
              const label =
                item.description?.trim() ||
                item.product_name?.trim() ||
                "Ordered service";
              return (
                <li
                  key={item.uuid}
                  className="flex items-start justify-between gap-3 py-3"
                  data-testid={`start-referral-order-${item.uuid}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {label}
                    </p>
                    {item.product_name &&
                    item.description &&
                    item.product_name.trim() !== item.description.trim() ? (
                      <p className="mt-0.5 truncate text-xs text-dash-muted">
                        {item.product_name}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
