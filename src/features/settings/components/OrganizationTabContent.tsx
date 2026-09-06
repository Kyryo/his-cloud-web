import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type OrganizationTabPanelProps = {
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function OrganizationTabPanel({
  description,
  action,
  children,
  className,
}: OrganizationTabPanelProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {description || action ? (
        <div className="flex items-start justify-between gap-4">
          {description ? (
            <p className="max-w-xl text-sm text-slate-400">{description}</p>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

type OrganizationEntityRowProps = {
  title: string;
  description?: string;
  meta?: string;
  status?: string;
  actions?: ReactNode;
};

export function OrganizationEntityRow({
  title,
  description,
  meta,
  status,
  actions,
}: OrganizationEntityRowProps) {
  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        ) : null}
        {meta ? (
          <p className="mt-0.5 truncate text-sm text-slate-400">{meta}</p>
        ) : null}
      </div>
      {status || actions ? (
        <div className="flex shrink-0 items-center gap-3">
          {status ? (
            <span className="text-xs text-slate-400">{status}</span>
          ) : null}
          {actions}
        </div>
      ) : null}
    </li>
  );
}

type ClinicGroup<T> = {
  clinicName: string;
  items: T[];
};

export function groupByClinicName<T>(
  items: T[],
  getClinicName: (item: T) => string,
): ClinicGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const clinicName = getClinicName(item).trim() || "Unassigned";
    const existing = groups.get(clinicName);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(clinicName, [item]);
    }
  }

  return [...groups.entries()]
    .map(([clinicName, grouped]) => ({ clinicName, items: grouped }))
    .toSorted((left, right) => left.clinicName.localeCompare(right.clinicName));
}

export function OrganizationClinicGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 pb-1">
        <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
          {title}
        </h4>
        <p className="text-xs text-slate-400">{count}</p>
      </div>
      <ul className="divide-y divide-brand-border">{children}</ul>
    </div>
  );
}

export function OrganizationFieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 border-b border-brand-border py-3.5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="min-w-0 text-sm text-brand-navy">{children}</div>
    </div>
  );
}
