"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InventoryMark } from "@/features/inventory/components/InventoryMark";
import type { InventoryMarkKind } from "@/features/inventory/utils/inventory-mark";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type InventoryDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  "data-testid"?: string;
  children: ReactNode;
};

export function InventoryDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  "data-testid": dataTestId,
  children,
}: InventoryDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
        )}
        data-testid={dataTestId}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

type InventoryDetailSheetHeaderProps = {
  kind: InventoryMarkKind;
  seed: string;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
};

export function InventoryDetailSheetHeader({
  kind,
  seed,
  title,
  subtitle,
  trailing,
}: InventoryDetailSheetHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-dash-border/60 px-6 py-5 pr-14">
      <InventoryMark kind={kind} seed={seed} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-brand-navy">{title}</p>
        <p className="mt-0.5 truncate text-sm text-dash-muted">{subtitle}</p>
      </div>
      {trailing}
    </div>
  );
}

type InventoryDetailHeroProps = {
  label: string;
  value: string;
  hint?: string;
  trailing?: ReactNode;
};

export function InventoryDetailHero({
  label,
  value,
  hint,
  trailing,
}: InventoryDetailHeroProps) {
  return (
    <section className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-dash-muted">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-brand-navy">
          {value}
        </p>
        {hint ? <p className="mt-1 text-sm text-dash-muted">{hint}</p> : null}
      </div>
      {trailing}
    </section>
  );
}

type InventoryDetailMetric = {
  label: string;
  value: string;
};

export function InventoryDetailMetrics({
  items,
}: {
  items: readonly InventoryDetailMetric[];
}) {
  return (
    <dl className="grid grid-cols-2 divide-x divide-dash-border/70 border-y border-dash-border/70">
      {items.map((item) => (
        <div key={item.label} className="px-0 py-3 first:pr-4 last:pl-4">
          <dt className="text-xs text-dash-muted">{item.label}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-brand-navy">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type InventoryDetailMetaRow = {
  label: string;
  value: string;
};

export function InventoryDetailMeta({
  rows,
}: {
  rows: readonly InventoryDetailMetaRow[];
}) {
  return (
    <dl className="divide-y divide-dash-border/70 border-y border-dash-border/70">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 py-3 first:pt-3 last:pb-3"
        >
          <dt className="shrink-0 text-sm text-dash-muted">{row.label}</dt>
          <dd className="min-w-0 text-right text-sm font-medium text-brand-navy">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
