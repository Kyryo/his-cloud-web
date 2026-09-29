"use client";

import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import {
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import type { OhVisitEncounter } from "@/features/occupational-health/types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatVisitElapsed } from "@/features/customers/utils/format-visit-elapsed";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { formatAge } from "@/lib/age";

type OhEncounterHeaderProps = {
  customer: Customer | null;
  encounter: OhVisitEncounter;
  actions?: ReactNode;
};

function formatStartedLabel(startedAt: string | null | undefined): string {
  if (!startedAt) {
    return "Not started";
  }
  const elapsed = formatVisitElapsed(startedAt);
  if (!elapsed) {
    return "Not started";
  }
  return elapsed === "Just now" ? "Started just now" : `Started ${elapsed} ago`;
}

export function OhEncounterHeader({
  customer,
  encounter,
  actions,
}: OhEncounterHeaderProps) {
  const fullName = customer
    ? formatCustomerName(customer)
    : "OH encounter";
  const identiconSeed =
    customer?.uuid ||
    customer?.customer_identifier ||
    fullName;

  const identity = [
    customer?.customer_identifier,
    customer ? formatAge(customer.dob, { empty: "" }) || null : null,
    customer?.gender,
  ]
    .filter(Boolean)
    .join(" · ");

  const meta: Array<{ key: string; label: string; value: string }> = [];

  if (encounter.department_name) {
    meta.push({
      key: "department",
      label: "Department",
      value: encounter.department_name,
    });
  }
  if (encounter.location_name) {
    meta.push({
      key: "location",
      label: "Location",
      value: encounter.location_name,
    });
  }
  if (encounter.clinician_name) {
    meta.push({
      key: "clinician",
      label: "Clinician",
      value: encounter.clinician_name,
    });
  }
  meta.push({
    key: "started",
    label: "Started",
    value: formatStartedLabel(encounter.started_at),
  });

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-4 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
        data-testid="oh-encounter-header"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserIdenticon
            seed={identiconSeed}
            name={fullName}
            className="size-10 shrink-0 rounded-lg sm:size-12"
            fallbackClassName="rounded-lg text-sm font-semibold"
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <DetailPageTitle className="text-lg sm:text-xl">
                {fullName}
              </DetailPageTitle>
              <OpdEncounterStatusBadge status={encounter.status} />
            </div>
            {identity ? (
              <p className="truncate font-mono text-[13px] text-brand-muted">
                {identity}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {meta.length > 0 ? (
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] text-brand-slate">
          {meta.map((item, index) => (
            <span key={item.key} className="inline-flex items-baseline gap-x-2">
              {index > 0 ? (
                <span className="text-dash-muted" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <span data-testid={`oh-encounter-fact-${item.key}`}>
                <span className="sr-only">{item.label}: </span>
                {item.value}
              </span>
            </span>
          ))}
        </p>
      ) : null}
    </DetailPageHeaderSection>
  );
}
