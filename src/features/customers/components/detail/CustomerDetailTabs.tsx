"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  customerDetailTabFromPathname,
  customerDetailTabHref,
  getCustomerDetailMenuTabs,
  getCustomerDetailPrimaryTabs,
  type CustomerDetailTab,
} from "@/features/customers/utils/customer-detail-tabs";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const TAB_ITEM_CLASS =
  "inline-flex items-center justify-start gap-1 px-2 py-1.5 text-left text-[13px]";

type CustomerDetailTabsProps = {
  customer: Customer;
  showBenefitsTab: boolean;
  showEmploymentTab?: boolean;
};

function CustomerDetailTabLabel({ tab }: { tab: CustomerDetailTab }) {
  return (
    <>
      <span aria-hidden="true" className="inline-flex">
        <AppIcon name={tab.icon} size={14} className="size-3.5" />
      </span>
      {tab.label}
    </>
  );
}

export function CustomerDetailTabs({
  customer,
  showBenefitsTab,
  showEmploymentTab = false,
}: CustomerDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = customerDetailTabFromPathname(pathname, customer.uuid);
  const visibility = { showBenefitsTab, showEmploymentTab };
  const primaryTabs = getCustomerDetailPrimaryTabs(visibility);
  const menuTabs = getCustomerDetailMenuTabs(visibility);
  const isMenuActive = menuTabs.some((tab) => tab.id === activeTab);

  return (
    <DetailPageTabsNavSection
      aria-label="Client sections"
      navClassName="min-w-0 overflow-x-hidden"
    >
      <div className="flex min-w-0 w-full items-end justify-start gap-0">
        <div className="scrollbar-hide flex min-w-0 flex-1 justify-start gap-0 overflow-x-auto">
          {primaryTabs.map((tab) => (
            <DetailPageTabNavItem
              key={tab.id}
              href={customerDetailTabHref(customer.uuid, tab.id)}
              isActive={activeTab === tab.id}
              className={TAB_ITEM_CLASS}
            >
              <CustomerDetailTabLabel tab={tab} />
            </DetailPageTabNavItem>
          ))}
        </div>

        {menuTabs.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "mb-px shrink-0 whitespace-nowrap text-sm font-medium transition-colors",
                  TAB_ITEM_CLASS,
                  isMenuActive
                    ? "text-brand-navy"
                    : "text-brand-muted hover:text-brand-navy",
                )}
                aria-label="More client sections"
                data-testid="customer-detail-tabs-more"
              >
                <AppIcon name="moreHorizontal" size={14} className="size-3.5" />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(appFont.className, "min-w-52")}
            >
              {menuTabs.map((tab) => (
                <DropdownMenuItem key={tab.id} asChild>
                  <Link
                    href={customerDetailTabHref(customer.uuid, tab.id)}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    className="inline-flex items-center gap-2"
                  >
                    <CustomerDetailTabLabel tab={tab} />
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </DetailPageTabsNavSection>
  );
}
