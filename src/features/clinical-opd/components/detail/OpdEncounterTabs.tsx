"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { appFont } from "@/lib/fonts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useOpdEncounterTabCounts } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  getVisibleOpdEncounterMenuSections,
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
  const menuSections = getVisibleOpdEncounterMenuSections(capabilities);
  const isMenuActive = menuSections.some((section) => section.id === activeTab);

  if (tabs.length === 0 && menuSections.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="OPD encounter sections"
      className={cn(
        "flex items-center gap-2 border-b border-dash-border/80 bg-white px-4 py-2 sm:px-6",
        className,
      )}
    >
      <div className="scrollbar-hide flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id];

          return (
            <Link
              key={tab.id}
              href={opdEncounterTabHref(visitUuid, encounterUuid, tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                isActive
                  ? "bg-brand-navy font-medium text-white shadow-sm"
                  : "bg-transparent font-medium text-brand-slate hover:bg-slate-100 hover:text-brand-navy",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-brand-muted",
                )}
              >
                {index + 1}
              </span>
              <span>{tab.label}</span>
              {count ? (
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    isActive ? "text-white/70" : "text-brand-muted"
                  )}
                  data-testid={`opd-encounter-tab-count-${tab.id}`}
                >
                  ({count})
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {menuSections.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              isMenuActive
                ? "bg-brand-navy text-white shadow-sm"
                : "bg-transparent text-brand-slate hover:bg-slate-100 hover:text-brand-navy",
            )}
            aria-label="More encounter sections"
            data-testid="opd-encounter-more-sections"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            More
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn("min-w-44", appFont.className)}
          >
            {menuSections.map((section) => (
              <DropdownMenuItem key={section.id} asChild>
                <Link
                  href={opdEncounterTabHref(
                    visitUuid,
                    encounterUuid,
                    section.id,
                  )}
                >
                  {section.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  );
}
