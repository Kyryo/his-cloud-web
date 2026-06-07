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
    <div className={cn("mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-6", className)}>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-brand-muted">{description}</p>
      </header>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
    >
      <div className="border-b border-brand-border px-6 py-4">
        <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-brand-muted">{description}</p>
        ) : null}
      </div>
      <div className="px-6 py-5">{children}</div>
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
  children: ReactNode;
  className?: string;
};

/** Flat section for content inside a single settings panel (no nested card). */
export function SettingsPanelSection({
  title,
  description,
  children,
  className,
}: SettingsPanelSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
        {description ? (
          <p className="text-sm text-brand-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
