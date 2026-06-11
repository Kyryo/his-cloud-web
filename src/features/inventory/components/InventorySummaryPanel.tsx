"use client";

import type { ReactNode } from "react";

import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

export function SummaryField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-brand-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-brand-navy">
        {value}
      </dd>
    </div>
  );
}

export function SummarySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-brand-border pt-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase text-brand-muted">
        {title}
      </h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

type InventorySummaryPanelProps = {
  title?: string;
  highlight?: ReactNode;
  sections: Array<{
    title: string;
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
        <div className="rounded-xl border border-brand-border bg-slate-50/60 p-4">
          {highlight}
        </div>
      ) : null}

      {sections.map((section) => (
        <SummarySection key={section.title} title={section.title}>
          {section.fields.map((field) => (
            <SummaryField
              key={field.label}
              label={field.label}
              value={field.value}
            />
          ))}
        </SummarySection>
      ))}

      {!highlight && sections.length === 0 ? (
        <h2 className="text-[11px] font-semibold uppercase text-brand-muted">
          {title}
        </h2>
      ) : null}
    </DetailPageAsidePanelSection>
  );
}
