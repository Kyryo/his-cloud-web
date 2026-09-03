"use client";

import { usePathname } from "next/navigation";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  getVisibleOpdEncounterTabs,
  opdEncounterTabFromPathname,
  opdEncounterTabHref,
} from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { cn } from "@/lib/utils";

type OpdEncounterTabsProps = {
  borderless?: boolean;
  className?: string;
};

export function OpdEncounterTabs({
  borderless = false,
  className,
}: OpdEncounterTabsProps) {
  const pathname = usePathname();
  const { visitUuid, encounterUuid, capabilities } = useOpdEncounterWorkspace();
  const activeTab = opdEncounterTabFromPathname(
    pathname,
    visitUuid,
    encounterUuid,
  );

  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <DetailPageTabsNavSection
      aria-label="OPD encounter sections"
      className={cn(borderless && "border-b-0", className)}
    >
      {visibleTabs.map((tab) => (
        <DetailPageTabNavItem
          key={tab.id}
          href={opdEncounterTabHref(visitUuid, encounterUuid, tab.id)}
          isActive={activeTab === tab.id}
          className="py-3"
        >
          {tab.label}
        </DetailPageTabNavItem>
      ))}
    </DetailPageTabsNavSection>
  );
}
