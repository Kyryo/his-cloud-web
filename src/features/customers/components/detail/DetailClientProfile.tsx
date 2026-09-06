import Link from "next/link";
import type { ReactNode } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { DetailPageAsideSummaryField } from "@/features/app-shell/components/page-layout";
import type { Customer } from "@/features/customers/types/customer.types";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import {
  formatAdaptiveAge,
  formatCustomerName,
} from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

export type DetailClientCoverageItem = {
  key: string;
  title: string;
  membership: string;
  details: string;
  isActive: boolean;
  onThisDocument?: string | null;
};

type DetailClientProfileProps = {
  customer: Customer;
  viewHref: string;
  coverage: DetailClientCoverageItem[];
  outstanding?: ReactNode;
  paid?: ReactNode;
  hasOutstanding?: boolean;
  "data-testid": string;
};

function buildIdentityMeta(customer: Customer): string {
  return [customer.customer_identifier, customer.gender, formatAdaptiveAge(customer.dob)]
    .filter(Boolean)
    .join(" · ");
}

export function DetailClientProfile({
  customer,
  viewHref,
  coverage,
  outstanding,
  paid,
  hasOutstanding = false,
  "data-testid": testId,
}: DetailClientProfileProps) {
  const fullName = formatCustomerName(customer);
  const phone = customer.phone_number?.trim() || "";
  const email = customer.email?.trim() || "";
  const currentCoverage =
    coverage.find((record) => record.onThisDocument) ?? coverage[0] ?? null;
  const otherCoverage = coverage.filter((record) => record !== currentCoverage);

  return (
    <div className="space-y-6" data-testid={testId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <ClientAvatar name={fullName} className="size-11 text-sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-brand-navy">
                {fullName}
              </h2>
              {isCustomerVisitActive(customer.visit_status) ? (
                <Badge variant="success" className="font-normal">
                  In clinic
                </Badge>
              ) : null}
              {!customer.is_active ? (
                <Badge variant="outline" className="font-normal">
                  Inactive
                </Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-brand-muted">
              {buildIdentityMeta(customer)}
            </p>
            {phone || email ? (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-brand-navy">
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {phone}
                  </a>
                ) : null}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="break-all underline-offset-4 hover:underline"
                  >
                    {email}
                  </a>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
        <SecondaryButton asChild className="shrink-0">
          <Link href={viewHref}>View client</Link>
        </SecondaryButton>
      </div>

      <dl className="grid gap-4 border-t border-dash-border/80 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailPageAsideSummaryField
          label="Coverage"
          value={
            currentCoverage ? (
              <span className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "font-medium text-brand-navy",
                    !currentCoverage.isActive && "text-brand-muted",
                  )}
                >
                  {currentCoverage.title}
                </span>
                {currentCoverage.onThisDocument ? (
                  <span className="text-xs font-medium text-brand-muted">
                    {currentCoverage.onThisDocument}
                  </span>
                ) : null}
              </span>
            ) : (
              "No insurance on file."
            )
          }
        />
        <DetailPageAsideSummaryField
          label="Member no."
          value={
            currentCoverage ? (
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-brand-navy">
                  {currentCoverage.membership}
                </span>
                <span className="text-xs text-brand-muted">
                  {currentCoverage.details}
                </span>
              </span>
            ) : (
              "—"
            )
          }
        />
        {outstanding != null ? (
          <DetailPageAsideSummaryField
            label="Outstanding"
            value={
              <span
                className={cn(
                  "tabular-nums",
                  hasOutstanding && "font-medium text-red-600",
                )}
              >
                {outstanding}
              </span>
            }
          />
        ) : null}
        {paid != null ? (
          <DetailPageAsideSummaryField
            label="Paid"
            value={<span className="tabular-nums">{paid}</span>}
          />
        ) : null}
      </dl>

      {otherCoverage.length > 0 ? (
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
            Other coverage
          </h3>
          <ul className="mt-3 divide-y divide-dash-border/60">
            {otherCoverage.map((record) => (
              <li key={record.key} className="py-2.5 first:pt-0">
                <p
                  className={cn(
                    "text-sm font-medium text-brand-navy",
                    !record.isActive && "text-brand-muted",
                  )}
                >
                  {record.title}
                </p>
                <p className="mt-0.5 font-mono text-xs text-brand-muted">
                  {record.membership}
                  {record.details ? ` · ${record.details}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
