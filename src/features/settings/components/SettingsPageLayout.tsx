"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SettingsPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function SettingsPageLayout({
  title,
  description,
  children,
  className,
}: SettingsPageLayoutProps) {
  return (
    <div className={cn("w-full min-w-0 space-y-8", className)}>
      <h2 className="sr-only">{title}</h2>
      {description ? (
        <p className="sr-only">{description}</p>
      ) : null}
      <div>{children}</div>
    </div>
  );
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Edge-to-edge children (for divided rows). */
  flush?: boolean;
};

export function SettingsSection({
  title,
  description,
  children,
  className,
  flush = false,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "min-w-0 space-y-5 border-t border-brand-border py-8 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-brand-navy">{title}</h3>
        {description ? (
          <p className="text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      <div className={cn(!flush && "space-y-5")}>{children}</div>
    </section>
  );
}

type SettingsDetailGridProps = {
  items: Array<{
    label: string;
    value: ReactNode;
  }>;
  tone?: "card" | "panel";
};

export function SettingsDetailGrid({
  items,
  tone = "card",
}: SettingsDetailGridProps) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt
            className={cn(
              tone === "panel"
                ? "text-sm text-brand-muted"
                : "text-xs font-medium uppercase tracking-wide text-brand-muted",
            )}
          >
            {item.label}
          </dt>
          <dd className="text-sm text-brand-navy">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type SettingsPanelSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Flat section for content inside a single settings panel (no nested card). */
export function SettingsPanelSection({
  title,
  description,
  action,
  children,
  className,
}: SettingsPanelSectionProps) {
  return (
    <section
      className={cn(
        "min-w-0 space-y-5 border-t border-brand-border py-8 first:border-t-0 first:pt-0",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-brand-navy">{title}</h3>
          {description ? (
            <p className="text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
