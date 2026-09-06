"use client";

import { useEffect, useRef, useState } from "react";
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
  CUSTOMER_DETAIL_TABS,
  customerDetailTabFromPathname,
  customerDetailTabHref,
  type CustomerDetailTab,
} from "@/features/customers/utils/customer-detail-tabs";
import { splitOverflowItems } from "@/features/customers/utils/split-overflow-tabs";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const TAB_ROW_GAP_PX = 0;
const TAB_ITEM_CLASS =
  "inline-flex items-center justify-start gap-1 px-2 py-1.5 text-left";

type CustomerDetailTabsProps = {
  customer: Customer;
  showBenefitsTab: boolean;
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
}: CustomerDetailTabsProps) {
  const pathname = usePathname();
  const activeTab = customerDetailTabFromPathname(pathname, customer.uuid);
  const visibleTabs = CUSTOMER_DETAIL_TABS.filter(
    (tab) => tab.id !== "benefits" || showBenefitsTab,
  );
  const [overflowIds, setOverflowIds] = useState<string[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const tabs = CUSTOMER_DETAIL_TABS.filter(
        (tab) => tab.id !== "benefits" || showBenefitsTab,
      );
      const availableWidth = entries[0]?.contentRect.width ?? nav.clientWidth;
      const children = [...measure.children];
      const more = children.at(-1);
      const tabEls = children.slice(0, -1);
      const itemWidths = tabEls.map((element) => element.getBoundingClientRect().width);
      const moreWidth = more?.getBoundingClientRect().width ?? 0;
      const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.id === activeTab),
      );
      const next = splitOverflowItems({
        items: tabs,
        itemWidths,
        moreWidth,
        availableWidth,
        gap: TAB_ROW_GAP_PX,
        activeIndex,
      });

      setOverflowIds(next.overflow.map((tab) => tab.id));
    });

    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeTab, showBenefitsTab]);

  const overflowSet = new Set(overflowIds);
  const inlineTabs = visibleTabs.filter((tab) => !overflowSet.has(tab.id));
  const overflowTabs = visibleTabs.filter((tab) => overflowSet.has(tab.id));

  return (
    <DetailPageTabsNavSection
      aria-label="Client sections"
      navClassName="min-w-0 overflow-x-hidden"
    >
      <div ref={navRef} className="relative flex min-w-0 w-full justify-start gap-0">
        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 flex justify-start gap-0 whitespace-nowrap"
        >
          {visibleTabs.map((tab) => (
            <span
              key={tab.id}
              className={cn(
                "whitespace-nowrap text-sm font-medium",
                TAB_ITEM_CLASS,
              )}
            >
              <CustomerDetailTabLabel tab={tab} />
            </span>
          ))}
          <span
            className={cn("whitespace-nowrap text-sm font-medium", TAB_ITEM_CLASS)}
          >
            <AppIcon name="moreHorizontal" size={14} className="size-3.5" />
            More
          </span>
        </div>

        {inlineTabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            href={customerDetailTabHref(customer.uuid, tab.id)}
            isActive={activeTab === tab.id}
            className={TAB_ITEM_CLASS}
          >
            <CustomerDetailTabLabel tab={tab} />
          </DetailPageTabNavItem>
        ))}

        {overflowTabs.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "whitespace-nowrap text-sm font-medium text-brand-muted transition-colors hover:text-brand-navy",
                  TAB_ITEM_CLASS,
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
              {overflowTabs.map((tab) => (
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
