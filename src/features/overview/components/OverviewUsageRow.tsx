"use client";

import { useState } from "react";
import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { workspaceAreaDetails } from "@/features/overview/utils/overview-quick-links";
import {
  rankOverviewUsage,
  shouldShowOverviewUsage,
  type WorkspaceUsageRow,
} from "@/features/overview/utils/overview-usage";

const USAGE_PREVIEW = 4;

type OverviewUsageRowProps = {
  rows: WorkspaceUsageRow[];
  userGroups: string[];
  enabledModules: string[];
  allowedHrefs: Set<string>;
};

export function OverviewUsageRow({
  rows,
  userGroups,
  enabledModules,
  allowedHrefs,
}: OverviewUsageRowProps) {
  const ranked = rankOverviewUsage(rows, allowedHrefs).slice(0, 8);
  const [expanded, setExpanded] = useState(false);
  if (!shouldShowOverviewUsage(ranked.length)) {
    return null;
  }

  const visible = expanded ? ranked : ranked.slice(0, USAGE_PREVIEW);
  const canExpand = ranked.length > USAGE_PREVIEW;

  return (
    <section aria-label="Based on your previous usage">
      <h2 className="text-sm font-medium text-dash-muted">
        Based on your previous usage
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((row) => {
          const area = workspaceAreaDetails(
            row.area_key,
            userGroups,
            enabledModules,
          );
          return (
            <li key={row.area_key}>
              <Link
                href={row.area_key}
                className="group flex h-full items-start gap-3 rounded-2xl bg-dash-canvas px-3.5 py-3 transition-colors hover:bg-brand-tint/70"
              >
                <AppIcon
                  name={area.icon}
                  size={16}
                  className="mt-0.5 shrink-0 text-dash-muted transition-colors group-hover:text-brand-primary"
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-brand-slate transition-colors group-hover:text-brand-primary">
                    {area.pageName}
                  </span>
                  {area.description ? (
                    <span className="mt-1 line-clamp-2 block text-[12px] leading-5 text-dash-muted">
                      {area.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
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
    </section>
  );
}
