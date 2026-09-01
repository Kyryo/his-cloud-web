"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import { Badge } from "@/components/ui/badge";
import { UserIdenticon } from "@/components/UserIdenticon";
import { ROUTES } from "@/constants/routes";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatOverviewRelativeTime,
  overviewClientName,
  type OverviewActivityItem,
  type OverviewActivityKind,
} from "@/features/overview/utils/overview-workspace";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/utils/format-compact-number";

export function OverviewCount({
  label,
  value,
  hint,
  href,
  indicator = "teal",
  pulse = false,
}: {
  label: string;
  value: number;
  hint: string;
  href?: string;
  indicator?: "emerald" | "blue" | "teal" | "amber";
  pulse?: boolean;
}) {
  const content = (
    <div className="group block h-full rounded-xl p-3 transition-colors hover:bg-dash-canvas/60 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {pulse ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <span
              className={cn("size-2 shrink-0 rounded-full", {
                "bg-emerald-500": indicator === "emerald",
                "bg-blue-500": indicator === "blue",
                "bg-brand-primary": indicator === "teal",
                "bg-amber-500": indicator === "amber",
              })}
            />
          )}
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted transition-colors group-hover:text-brand-navy">
            {label}
          </dt>
        </div>
        {href ? (
          <AppIcon
            name="chevronRight"
            className="size-3 text-dash-muted/40 transition-all group-hover:translate-x-0.5 group-hover:text-brand-primary"
          />
        ) : null}
      </div>
      <dd className="mt-2 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
        {formatCompactNumber(value)}
      </dd>
      <p className="mt-1 line-clamp-1 text-xs text-brand-muted">{hint}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function OverviewSection({
  title,
  href,
  actionLabel,
  badge,
  children,
}: {
  title: string;
  href?: string;
  actionLabel?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 border-b border-dash-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold tracking-tight text-brand-navy">
            {title}
          </h2>
          {badge}
        </div>
        {href && actionLabel ? (
          <Link
            href={href}
            className="group flex items-center gap-1 text-xs font-medium text-dash-muted transition-colors hover:text-brand-primary"
          >
            <span>{actionLabel}</span>
            <AppIcon
              name="chevronRight"
              className="size-3 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

const KIND_CONFIG: Record<
  OverviewActivityKind,
  {
    icon: AppIconName;
    badgeStyle: string;
  }
> = {
  visit: {
    icon: "heartPulse",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  },
  appointment: {
    icon: "calendarClock",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/70",
  },
  inbox: {
    icon: "notification",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/70",
  },
};

export function OverviewActivityStream({
  items,
  selectedKind,
  onSelectKind,
}: {
  items: OverviewActivityItem[];
  selectedKind: "all" | OverviewActivityKind;
  onSelectKind: (kind: "all" | OverviewActivityKind) => void;
}) {
  const filteredItems =
    selectedKind === "all"
      ? items
      : items.filter((item) => item.kind === selectedKind);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [
            { id: "all", label: "All activity" },
            { id: "visit", label: "Visits" },
            { id: "appointment", label: "Appointments" },
            { id: "inbox", label: "Updates" },
          ] as const
        ).map((tab) => {
          const isSelected = selectedKind === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectKind(tab.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-brand-navy text-white shadow-xs"
                  : "text-dash-muted hover:bg-dash-canvas hover:text-brand-navy",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-10 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-dash-canvas text-dash-muted">
            <AppIcon name="activity" className="size-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-brand-navy">
            No activity to display
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            {selectedKind === "all"
              ? "New patient check-ins and appointments will stream here."
              : `No ${selectedKind} updates found for today.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const config = KIND_CONFIG[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start justify-between gap-3 rounded-xl p-2.5 transition-colors hover:bg-dash-canvas/70"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                        config.badgeStyle,
                      )}
                    >
                      <AppIcon name={config.icon} className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-brand-navy transition-colors group-hover:text-brand-primary">
                          {item.title}
                        </span>
                        {item.statusLabel ? (
                          <Badge
                            variant={item.statusVariant ?? "outline"}
                            className="h-4.5 px-1.5 text-[10px] font-medium capitalize"
                          >
                            {item.statusLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-2 text-right">
                    <time
                      dateTime={item.occurredAt}
                      className="text-xs text-dash-muted tabular-nums"
                    >
                      {formatOverviewRelativeTime(item.occurredAt)}
                    </time>
                    <AppIcon
                      name="chevronRight"
                      className="hidden size-3.5 text-dash-muted/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-primary sm:block"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function OverviewRecentClients({
  clients,
}: {
  clients: Customer[];
}) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-8 text-center">
        <div className="flex size-9 items-center justify-center rounded-full bg-dash-canvas text-dash-muted">
          <AppIcon name="users" className="size-4.5" />
        </div>
        <p className="mt-2 text-sm font-medium text-brand-navy">
          No clients registered yet
        </p>
        <p className="mt-0.5 text-xs text-brand-muted">
          Register new patients to build your clinic directory.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {clients.map((customer) => {
        const name = overviewClientName(customer);
        const identifier = customer.customer_identifier || "No MRN";
        const meta = [
          customer.gender,
          customer.age ? `${customer.age}y` : null,
          customer.phone_number,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={customer.uuid}>
            <Link
              href={ROUTES.customerDetail(customer.uuid)}
              className="group flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors hover:bg-dash-canvas/70"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserIdenticon
                  seed={customer.uuid || identifier || name}
                  name={name}
                  className="size-8.5 rounded-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-brand-navy transition-colors group-hover:text-brand-primary">
                    {name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <span className="font-mono text-[11px] text-dash-muted">
                      {identifier}
                    </span>
                    {meta ? (
                      <>
                        <span>·</span>
                        <span className="truncate">{meta}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <CustomerVisitStatusBadge
                  status={customer.visit_status}
                  className="text-[11px]"
                />
                <AppIcon
                  name="chevronRight"
                  className="hidden size-3.5 text-dash-muted/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-primary sm:block"
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const WORKSTATIONS: Array<{
  name: string;
  description: string;
  href: string;
  icon: AppIconName;
}> = [
  {
    name: "Active Visits Queue",
    description: "Live waiting room and consultation flow",
    href: ROUTES.activeVisits,
    icon: "heartPulse",
  },
  {
    name: "Appointments Calendar",
    description: "Schedule consultations and provider bookings",
    href: ROUTES.appointments,
    icon: "calendar",
  },
  {
    name: "Client Directory",
    description: "Search and manage all patient profiles",
    href: ROUTES.customers,
    icon: "users",
  },
  {
    name: "Pharmacy Dispensing",
    description: "Prescriptions fulfillment and medication stock",
    href: ROUTES.pharmacyQueue,
    icon: "pill",
  },
  {
    name: "Insurance Claims Engine",
    description: "Payer submissions and reconciliation batches",
    href: ROUTES.claims,
    icon: "shield",
  },
];

export function OverviewWorkstations() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {WORKSTATIONS.map((station) => (
        <Link
          key={station.name}
          href={station.href}
          className="group flex items-center justify-between gap-3 rounded-xl border border-dash-border/70 p-3 transition-all hover:border-brand-primary/40 hover:bg-dash-canvas/60"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
              <AppIcon name={station.icon} className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-brand-navy transition-colors group-hover:text-brand-primary">
                {station.name}
              </div>
              <p className="truncate text-[11px] text-brand-muted">
                {station.description}
              </p>
            </div>
          </div>
          <AppIcon
            name="chevronRight"
            className="size-3.5 shrink-0 text-dash-muted/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
          />
        </Link>
      ))}
    </div>
  );
}
