"use client";

import { usePathname } from "next/navigation";

import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useOpdEncounterTabCounts } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  getVisibleOpdEncounterTabGroups,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const groups = getVisibleOpdEncounterTabGroups(capabilities);

  if (groups.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="OPD encounter sections"
      className={cn(
        "flex gap-6 overflow-x-auto border-b border-dash-border/80 px-4 py-3 sm:px-6",
        "xl:w-52 xl:shrink-0 xl:flex-col xl:gap-5 xl:overflow-visible xl:border-b-0 xl:border-r xl:px-4 xl:py-5",
        className,
      )}
    >
      {groups.map((group) => (
        <div key={group.id} className="min-w-max xl:min-w-0">
          {group.label ? (
            <p className="mb-1.5 text-xs text-dash-muted">{group.label}</p>
          ) : null}
          <div className="flex gap-1 xl:flex-col">
            {group.tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];

              return (
                <Link
                  key={tab.id}
                  href={opdEncounterTabHref(visitUuid, encounterUuid, tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium",
                    isActive
                      ? "bg-brand-tint text-brand-primary"
                      : "text-brand-muted hover:bg-dash-canvas hover:text-brand-navy",
                  )}
                >
                  <span>{tab.label}</span>
                  {count ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none tabular-nums",
                        isActive
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "bg-slate-100 text-brand-muted",
                      )}
                      data-testid={`opd-encounter-tab-count-${tab.id}`}
                    >
                      {count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
