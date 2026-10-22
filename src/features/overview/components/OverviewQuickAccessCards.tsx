"use client";

import { useState } from "react";
import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { buildOverviewQuickLinks } from "@/features/overview/utils/overview-quick-links";
import {
  OVERVIEW_QUICK_ACCESS_LIMIT,
  type OverviewActionCard,
} from "@/features/overview/utils/overview-start";
import { cn } from "@/lib/utils";

type OverviewQuickAccessCardsProps = {
  cards: OverviewActionCard[];
  userGroups: string[];
  enabledModules: string[];
};

export function OverviewQuickAccessCards({
  cards,
  userGroups,
  enabledModules,
}: OverviewQuickAccessCardsProps) {
  const [showAll, setShowAll] = useState(false);
  const allLinks = buildOverviewQuickLinks(userGroups, enabledModules);
  const primary = cards.slice(0, OVERVIEW_QUICK_ACCESS_LIMIT);

  if (primary.length === 0 && allLinks.length === 0) {
    return null;
  }

  const fallback: OverviewActionCard[] = allLinks
    .slice(0, OVERVIEW_QUICK_ACCESS_LIMIT)
    .map((link, index) => ({ ...link, isPrimary: index === 0 }));
  const visible = primary.length > 0 ? primary : fallback;

  return (
    <section aria-label="Quick access" data-testid="overview-quick-access">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className={cn(
                "group flex h-full min-h-[5.75rem] flex-col justify-between rounded-2xl px-4 py-4 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35",
                card.isPrimary
                  ? "bg-brand-navy text-white hover:bg-brand-navy/92"
                  : "bg-[#f0f0f0] text-brand-navy hover:bg-[#e8e8e8]",
              )}
            >
              <AppIcon
                name={card.icon}
                size={20}
                className={cn(
                  "shrink-0",
                  card.isPrimary ? "text-white/90" : "text-brand-navy/80",
                )}
              />
              <span
                className={cn(
                  "mt-6 text-[15px] font-medium tracking-tight",
                  card.isPrimary ? "text-white" : "text-brand-navy",
                )}
              >
                {card.pageName}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {allLinks.length > OVERVIEW_QUICK_ACCESS_LIMIT ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            className="text-[13px] font-medium text-dash-muted transition-colors hover:text-brand-navy"
            aria-expanded={showAll}
          >
            {showAll ? "Show fewer actions" : "View all actions"}
          </button>
          {showAll ? (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allLinks
                .filter(
                  (link) => !visible.some((card) => card.href === link.href),
                )
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-brand-navy transition-colors hover:bg-[#f0f0f0]"
                    >
                      <AppIcon
                        name={link.icon}
                        size={16}
                        className="text-dash-muted"
                      />
                      {link.pageName}
                    </Link>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
