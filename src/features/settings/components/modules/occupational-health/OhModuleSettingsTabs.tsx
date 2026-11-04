"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { OhCatalogSettingsTab } from "@/features/settings/components/modules/occupational-health/OhCatalogSettingsTab";
import { OhEmployersSettingsTab } from "@/features/settings/components/modules/occupational-health/OhEmployersSettingsTab";
import { OhExamTemplatesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhExamTemplatesSettingsTab";
import { cn } from "@/lib/utils";

export type OhModuleTabId = "employers" | "catalog" | "exam-templates";

const TABS: Array<{ id: OhModuleTabId; label: string }> = [
  { id: "employers", label: "Employers" },
  { id: "catalog", label: "COF templates" },
  { id: "exam-templates", label: "Exam templates" },
];

function parseTab(value: string | null): OhModuleTabId {
  if (value === "catalog") {
    return "catalog";
  }
  if (value === "exam-templates") {
    return "exam-templates";
  }
  return "employers";
}

function OhModuleSettingsTabsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseTab(searchParams.get("tab")),
    [searchParams],
  );

  function setActiveTab(tab: OhModuleTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "employers") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
      params.delete("employer");
      params.delete("section");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div>
      <nav
        aria-label="Occupational health module settings"
        className="flex gap-6 border-b border-dash-border"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 pb-2.5 text-[13px]",
                selected
                  ? "border-brand-navy font-medium text-brand-navy"
                  : "border-transparent text-dash-muted hover:text-brand-navy",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div>
        <OhEmployersSettingsTab isActive={activeTab === "employers"} />
        <OhCatalogSettingsTab isActive={activeTab === "catalog"} />
        <OhExamTemplatesSettingsTab
          isActive={activeTab === "exam-templates"}
        />
      </div>
    </div>
  );
}

export function OhModuleSettingsTabs() {
  return (
    <Suspense fallback={<SettingsContentSkeleton />}>
      <OhModuleSettingsTabsInner />
    </Suspense>
  );
}
