"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check, MoreHorizontal } from "lucide-react";

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
        "flex items-end gap-1 border-b border-dash-border/80 px-4 sm:px-6",
        className,
      )}
    >
      <div className="scrollbar-hide flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] ?? 0;
          // The circle answers "is this step done?"; the pill answers "how many?".
          const isRecorded = count > 0;

          return (
            <Link
              key={tab.id}
              href={opdEncounterTabHref(visitUuid, encounterUuid, tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border-b-2 px-2.5 py-2.5 text-sm",
                isActive
                  ? "border-brand-primary font-semibold text-brand-navy"
                  : "border-transparent font-medium text-brand-muted hover:text-brand-navy",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums",
                  isActive
                    ? "bg-brand-primary text-white"
                    : isRecorded
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-slate-100 text-brand-muted",
                )}
                aria-hidden="true"
              >
                {isRecorded ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span>{tab.label}</span>
              {isRecorded ? (
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

      {menuSections.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm font-medium",
              isMenuActive
                ? "border-brand-primary text-brand-navy"
                : "border-transparent text-brand-muted hover:text-brand-navy",
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
