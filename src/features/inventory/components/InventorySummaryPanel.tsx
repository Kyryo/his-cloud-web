"use client";

import type { ReactNode } from "react";

import {
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

type InventorySummaryPanelProps = {
  title?: string;
  highlight?: ReactNode;
  sections: Array<{
    title: string;
    action?: ReactNode;
    fields: Array<{ label: string; value: ReactNode }>;
  }>;
  className?: string;
};

export function InventorySummaryPanel({
  title = "Summary",
  highlight,
  sections,
  className,
}: InventorySummaryPanelProps) {
  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      {highlight ? (
        <DetailPageAsideSummaryHighlight>{highlight}</DetailPageAsideSummaryHighlight>
      ) : null}

      {sections.map((section) => (
        <DetailPageAsideSummarySection
          key={section.title}
          title={section.title}
          action={section.action}
        >
          {section.fields.map((field) => (
            <DetailPageAsideSummaryField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </DetailPageAsideSummarySection>
      ))}

      {!highlight && sections.length === 0 ? (
        <h2 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          {title}
        </h2>
      ) : null}
    </DetailPageAsidePanelSection>
  );
}

// Re-export shared field/section for callers that import from here.
export {
  DetailPageAsideSummaryField as SummaryField,
  DetailPageAsideSummarySection as SummarySection,
} from "@/features/app-shell/components/page-layout";
