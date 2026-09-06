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

export function SettingsUnderlineTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
}: {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <nav
      className="flex gap-5 overflow-x-auto border-b border-brand-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 pb-2.5 text-sm transition-colors",
              isActive
                ? "font-medium text-brand-navy shadow-[inset_0_-2px_0_0_currentColor]"
                : "text-slate-400 hover:text-brand-navy",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export function SettingsPreferenceToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
  testId,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  testId?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-brand-navy">{label}</span>
        <span className="mt-0.5 block text-sm text-slate-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        data-testid={testId}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 rounded border-brand-border text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

export function SettingsFieldRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 border-b border-brand-border py-3.5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="min-w-0 text-sm text-brand-navy">{children}</div>
    </div>
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
