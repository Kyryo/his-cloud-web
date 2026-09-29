"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const OH_ENCOUNTER_TABS = [
  { id: "exam", label: "Exam" },
  { id: "fitness", label: "Fitness" },
  { id: "iod", label: "IOD" },
  { id: "findings", label: "Findings" },
] as const;

export type OhEncounterTabId = (typeof OH_ENCOUNTER_TABS)[number]["id"];

type OhEncounterTabsProps = {
  activeTab: OhEncounterTabId;
  counts?: Partial<Record<OhEncounterTabId, number>>;
  onTabChange: (tab: OhEncounterTabId) => void;
  className?: string;
};

export function OhEncounterTabs({
  activeTab,
  counts = {},
  onTabChange,
  className,
}: OhEncounterTabsProps) {
  return (
    <nav
      aria-label="Occupational health encounter sections"
      className={cn(
        "flex items-end gap-1 border-b border-dash-border/80 px-4 sm:px-6",
        className,
      )}
      data-testid="oh-encounter-tabs"
    >
      <div className="scrollbar-hide flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {OH_ENCOUNTER_TABS.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] ?? 0;
          const isRecorded = count > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
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
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
