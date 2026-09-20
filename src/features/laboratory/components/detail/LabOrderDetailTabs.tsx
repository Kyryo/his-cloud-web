"use client";

import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import {
  LAB_ORDER_DETAIL_TABS,
  labOrderDetailTabFromPathname,
  labOrderDetailTabHref,
} from "@/features/laboratory/utils/lab-order-detail-tabs";

type LabOrderDetailTabsProps = {
  orderUuid: string;
};

export function LabOrderDetailTabs({ orderUuid }: LabOrderDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = labOrderDetailTabFromPathname(pathname, orderUuid);

  return (
    <DetailPageTabsNavSection aria-label="Laboratory order sections">
      {LAB_ORDER_DETAIL_TABS.map((tab) => (
        <DetailPageTabNavItem
          key={tab.id}
          href={labOrderDetailTabHref(orderUuid, tab.id)}
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
