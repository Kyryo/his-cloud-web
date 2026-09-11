"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { RECEIVABLES_AGING_BUCKETS } from "@/features/receivables/types/receivables.types";
import type {
  ReceivablesAgingBucket,
  ReceivablesSummaryStats,
} from "@/features/receivables/types/receivables.types";
import { formatReceivablesAgingLabel } from "@/features/receivables/utils/format-receivables";
import {
  receivablesHref,
  type ReceivablesView,
} from "@/features/receivables/utils/receivables-views";
import { cn } from "@/lib/utils";
import { formatCompactAmount, formatCompactNumber } from "@/utils/format-compact-number";

type ReceivablesInsightsProps = {
  stats: ReceivablesSummaryStats | null;
  view: ReceivablesView;
  search: string;
  aging: ReceivablesAgingBucket | null;
  isLoading?: boolean;
};

const AGING_DOT: Record<ReceivablesAgingBucket, string> = {
  "0-30": "bg-slate-400",
  "31-60": "bg-amber-500",
  "61-90": "bg-orange-500",
  "90+": "bg-red-500",
};

function emptyAgingTotal() {
  return { count: 0, total: "0.00" };
}

export function ReceivablesInsights({
  stats,
  view,
  search,
  aging,
  isLoading = false,
}: ReceivablesInsightsProps) {
  if (isLoading && !stats) {
    return (
      <div
        className="border-y border-dash-border/80"
        data-testid="receivables-insights"
        aria-busy="true"
      >
        <div className="grid grid-cols-3 divide-x divide-dash-border/60 py-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="p-3.5 sm:p-4">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-2.5 h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalReceivable = stats?.total_receivable ?? "0";
  const debtorsCount = stats?.debtors_count ?? 0;
  const invoiceCount = stats?.open_invoice_count ?? 0;

  return (
    <div className="border-y border-dash-border/80" data-testid="receivables-insights">
      <dl className="grid grid-cols-3 divide-x divide-dash-border/60">
        <div className="p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Outstanding
          </dt>
          <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-brand-navy">
            {formatCompactAmount(totalReceivable)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">MWK still due</p>
        </div>
        <Link
          href={receivablesHref({ view: "debtors", search })}
          className={cn(
            "p-3 transition-colors hover:bg-dash-canvas/40",
            view === "debtors" && "bg-dash-canvas/50",
          )}
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Debtors
          </dt>
          <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-brand-navy">
            {formatCompactNumber(debtorsCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Clients with a balance</p>
        </Link>
        <Link
          href={receivablesHref({ view: "invoices", search, aging })}
          className={cn(
            "p-3 transition-colors hover:bg-dash-canvas/40",
            view === "invoices" && !aging && "bg-dash-canvas/50",
          )}
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
            Open invoices
          </dt>
          <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-brand-navy">
            {formatCompactNumber(invoiceCount)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Posted and unpaid</p>
        </Link>
      </dl>

      <div className="grid grid-cols-2 divide-x divide-y divide-dash-border/60 border-t border-dash-border/60 sm:grid-cols-4 sm:divide-y-0">
        {RECEIVABLES_AGING_BUCKETS.map((bucket) => {
          const bucketStats = stats?.aging[bucket] ?? emptyAgingTotal();
          const isActive = view === "invoices" && aging === bucket;

          return (
            <Link
              key={bucket}
              href={receivablesHref({
                view: "invoices",
                search,
                aging: isActive ? null : bucket,
              })}
              className={cn(
                "p-3 transition-colors hover:bg-dash-canvas/40",
                isActive && "bg-dash-canvas/50",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn("size-2 shrink-0 rounded-full", AGING_DOT[bucket])}
                />
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
                  {formatReceivablesAgingLabel(bucket)}
                </p>
              </div>
              <p className="mt-1.5 text-lg font-semibold tabular-nums text-brand-navy">
                {formatCompactAmount(bucketStats.total)}
              </p>
              <p className="mt-0.5 text-xs text-brand-muted">
                {bucketStats.count}{" "}
                {bucketStats.count === 1 ? "invoice" : "invoices"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
