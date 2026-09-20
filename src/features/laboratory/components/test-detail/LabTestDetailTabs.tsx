"use client";

import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import {
  LAB_TEST_DETAIL_TABS,
  labTestDetailTabFromPathname,
  labTestDetailTabHref,
} from "@/features/laboratory/utils/lab-test-detail-tabs";

type LabTestDetailTabsProps = {
  testUuid: string;
};

export function LabTestDetailTabs({ testUuid }: LabTestDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = labTestDetailTabFromPathname(pathname, testUuid);

  return (
    <DetailPageTabsNavSection aria-label="Laboratory test sections">
      {LAB_TEST_DETAIL_TABS.map((tab) => (
        <DetailPageTabNavItem
          key={tab.id}
          href={labTestDetailTabHref(testUuid, tab.id)}
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
