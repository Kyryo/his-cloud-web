"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type InspectorTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type InspectorShellProps = {
  eyebrow: ReactNode;
  title: string;
  children?: ReactNode;
  tabs?: InspectorTab[];
  footer?: ReactNode;
};

export function InspectorShell({ eyebrow, title, children, tabs, footer }: InspectorShellProps) {
  const [activeId, setActiveId] = useState(tabs?.[0]?.id ?? "");
  const active = tabs?.find((tab) => tab.id === activeId) ?? tabs?.[0];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-dash-border px-5 pt-4">
        <div className="text-xs text-dash-muted">{eyebrow}</div>
        <h2 className="mt-1 truncate text-base font-semibold tracking-tight text-brand-navy">
          {title}
        </h2>
        {tabs && tabs.length > 0 ? (
          <div role="tablist" aria-label={typeof title === "string" ? title : "Inspector"} className="mt-3 flex gap-5">
            {tabs.map((tab) => {
              const selected = tab.id === active?.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(tab.id)}
                  className={cn(
                    "-mb-px border-b-2 pb-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
                    selected
                      ? "border-brand-primary font-medium text-brand-navy"
                      : "border-transparent text-dash-muted hover:text-brand-navy",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {tabs && tabs.length > 0
          ? tabs.map((tab) => (
              <div key={tab.id} role="tabpanel" hidden={tab.id !== active?.id}>
                {tab.content}
              </div>
            ))
          : children}
      </div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dash-border bg-white px-5 py-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function InspectorToggleRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-navy">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-dash-muted">{description}</p>
      </div>
      {control}
    </div>
  );
}
