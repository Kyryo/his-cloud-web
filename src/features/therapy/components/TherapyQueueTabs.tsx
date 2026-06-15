"use client";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";

export type TherapyQueueTab = "active" | "all";

export function TherapyQueueTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TherapyQueueTab;
  onTabChange: (tab: TherapyQueueTab) => void;
}) {
  return (
    <DetailPageTabsNavSection
      aria-label="Therapy visit queues"
      className="w-fit shrink-0 border-b border-brand-border bg-transparent [&>nav]:px-0"
    >
      {(["active", "all"] as const).map((tab) => (
        <DetailPageTabNavItem
          key={tab}
          isActive={activeTab === tab}
          onClick={() => onTabChange(tab)}
        >
          {tab === "active" ? "Active" : "All"}
        </DetailPageTabNavItem>
      ))}
    </DetailPageTabsNavSection>
  );
}
