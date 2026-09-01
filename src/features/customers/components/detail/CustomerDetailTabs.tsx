"use client";

import { usePathname } from "next/navigation";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  CUSTOMER_DETAIL_TABS,
  customerDetailTabFromPathname,
  customerDetailTabHref,
} from "@/features/customers/utils/customer-detail-tabs";

type CustomerDetailTabsProps = {
  customer: Customer;
  showBenefitsTab: boolean;
};

export function CustomerDetailTabs({
  customer,
  showBenefitsTab,
}: CustomerDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = customerDetailTabFromPathname(pathname, customer.uuid);
  const visibleTabs = CUSTOMER_DETAIL_TABS.filter(
    (tab) => tab.id !== "benefits" || showBenefitsTab,
  );

  return (
    <DetailPageTabsNavSection aria-label="Client sections">
      {visibleTabs.map((tab) => (
        <DetailPageTabNavItem
          key={tab.id}
          href={customerDetailTabHref(customer.uuid, tab.id)}
          isActive={activeTab === tab.id}
        >
          {tab.label}
        </DetailPageTabNavItem>
      ))}
    </DetailPageTabsNavSection>
  );
}
