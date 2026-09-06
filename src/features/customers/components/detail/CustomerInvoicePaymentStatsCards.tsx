"use client";

import type { CustomerInvoicesStats } from "@/features/customers/types/customer-billing.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";
import { cn } from "@/lib/utils";

type CustomerInvoicePaymentStatsCardsProps = {
  stats: CustomerInvoicesStats | null;
  className?: string;
};

export function CustomerInvoicePaymentStatsCards({
  stats,
  className,
}: CustomerInvoicePaymentStatsCardsProps) {
  const buckets = stats ?? {
    all: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
    not_paid: { count: 0, total: 0 },
    partially_paid: { count: 0, total: 0 },
  };

  return (
    <dl
      className={cn(
        "grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x",
        className,
      )}
      data-testid="customer-invoice-payment-stats"
    >
      {/* 1. All invoices */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-blue-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            All invoices
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.all.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.all.total, "MWK")}
        >
          {formatCompactAmount(buckets.all.total)}
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-dash-muted">
            MWK
          </span>{" "}
          · Total billed
        </p>
      </div>

      {/* 2. Paid */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Paid
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.paid.total, "MWK")}
        >
          <span className="font-medium text-emerald-700">
            {formatCompactAmount(buckets.paid.total)}
          </span>
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-dash-muted">
            MWK
          </span>{" "}
          · Settled
        </p>
      </div>

      {/* 3. Unpaid */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-red-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Unpaid
          </dt>
        </div>
        <dd
          className={cn(
            "mt-1.5 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
            buckets.not_paid.count > 0 ? "text-red-600" : "text-brand-navy",
          )}
        >
          {formatCompactNumber(buckets.not_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.not_paid.total, "MWK")}
        >
          <span className={cn(buckets.not_paid.count > 0 && "font-medium text-red-700")}>
            {formatCompactAmount(buckets.not_paid.total)}
          </span>
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-dash-muted">
            MWK
          </span>{" "}
          · Unpaid
        </p>
      </div>

      {/* 4. Partially paid */}
      <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Partially paid
          </dt>
        </div>
        <dd className="mt-1.5 text-2xl font-bold tracking-tight text-brand-navy tabular-nums sm:text-3xl">
          {formatCompactNumber(buckets.partially_paid.count)}
        </dd>
        <p
          className="mt-0.5 text-xs text-brand-muted"
          title={formatSalesOrderAmount(buckets.partially_paid.total, "MWK")}
        >
          {formatCompactAmount(buckets.partially_paid.total)}
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-dash-muted">
            MWK
          </span>{" "}
          · Partial
        </p>
      </div>
    </dl>
  );
}
