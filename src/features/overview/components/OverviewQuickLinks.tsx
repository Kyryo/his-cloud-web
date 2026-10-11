"use client";

import { useState } from "react";
import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import {
  buildOverviewQuickLinks,
  OVERVIEW_QUICK_LINK_PREVIEW,
} from "@/features/overview/utils/overview-quick-links";

type OverviewQuickLinksProps = {
  userGroups: string[];
  enabledModules: string[];
};

export function OverviewQuickLinks({
  userGroups,
  enabledModules,
}: OverviewQuickLinksProps) {
  const links = buildOverviewQuickLinks(userGroups, enabledModules);
  const [expanded, setExpanded] = useState(false);
  if (links.length === 0) {
    return null;
  }

  const visible = expanded
    ? links
    : links.slice(0, OVERVIEW_QUICK_LINK_PREVIEW);
  const canExpand = links.length > OVERVIEW_QUICK_LINK_PREVIEW;

  return (
    <nav aria-label="Quick links">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-3 rounded-2xl bg-dash-canvas px-4 py-3.5 text-brand-navy transition-colors hover:bg-brand-tint"
            >
              <AppIcon
                name={link.icon}
                size={18}
                className="shrink-0 text-brand-navy"
              />
              <span className="min-w-0 flex-1 text-[15px] font-medium">
                {link.label}
              </span>
              <AppIcon
                name="chevronRight"
                size={16}
                className="shrink-0 text-dash-muted"
              />
            </Link>
          </li>
        ))}
      </ul>
      {canExpand ? (
        <button
          type="button"
          className="mt-3 block text-left text-[13px] text-dash-muted transition-colors hover:text-brand-navy"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show less" : "See more"}
        </button>
      ) : null}
    </nav>
  );
}
