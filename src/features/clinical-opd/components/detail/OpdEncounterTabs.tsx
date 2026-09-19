"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useOpdEncounterTabCounts } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  getVisibleOpdEncounterTabs,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { cn } from "@/lib/utils";

type OpdEncounterTabsProps = {
  className?: string;
};

export function OpdEncounterTabs({ className }: OpdEncounterTabsProps) {
  const pathname = usePathname();
  const { visitUuid, encounterUuid, capabilities } = useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );
  const counts = useOpdEncounterTabCounts(visitUuid, encounterUuid);
  const tabs = getVisibleOpdEncounterTabs(capabilities);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="OPD encounter sections"
      className={cn(
        "scrollbar-hide flex gap-1 overflow-x-auto border-b border-dash-border/80 px-4 sm:px-6",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <Link
            key={tab.id}
            href={opdEncounterTabHref(visitUuid, encounterUuid, tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm font-medium",
              isActive
                ? "border-brand-primary text-brand-navy"
                : "border-transparent text-brand-muted hover:text-brand-navy",
            )}
          >
            <span>{tab.label}</span>
            {count ? (
              <span
                className="tabular-nums text-xs text-dash-muted"
                data-testid={`opd-encounter-tab-count-${tab.id}`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
