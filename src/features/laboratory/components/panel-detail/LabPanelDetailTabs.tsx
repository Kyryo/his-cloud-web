"use client";

import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import {
  LAB_PANEL_DETAIL_TABS,
  labPanelDetailTabFromPathname,
  labPanelDetailTabHref,
} from "@/features/laboratory/utils/lab-panel-detail-tabs";

type LabPanelDetailTabsProps = {
  panelUuid: string;
};

export function LabPanelDetailTabs({ panelUuid }: LabPanelDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = labPanelDetailTabFromPathname(pathname, panelUuid);

  return (
    <DetailPageTabsNavSection aria-label="Laboratory panel sections">
      {LAB_PANEL_DETAIL_TABS.map((tab) => (
        <DetailPageTabNavItem
          key={tab.id}
          href={labPanelDetailTabHref(panelUuid, tab.id)}
          isActive={activeTab === tab.id}
          className="inline-flex items-center justify-start gap-1 px-2 py-1.5 text-left"
        >
          <span aria-hidden="true" className="inline-flex">
            <AppIcon name={tab.icon} size={14} className="size-3.5" />
          </span>
          {tab.label}
        </DetailPageTabNavItem>
      ))}
    </DetailPageTabsNavSection>
  );
}
