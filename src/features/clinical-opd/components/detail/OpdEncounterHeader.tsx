"use client";

import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { formatOpdEncounterPaymentLabel } from "@/features/clinical-opd/utils/format-opd-encounter-payment";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatVisitElapsed } from "@/features/customers/utils/format-visit-elapsed";
import {
  formatAdaptiveAge,
  formatCustomerName,
} from "@/features/customers/utils/format-customer";

type OpdEncounterHeaderProps = {
  customer: Customer | null;
  actions?: ReactNode;
};

const QUEUE_STAGE_LABELS: Record<string, string> = {
  registered: "Registered",
  triaged: "Ready",
  with_clinician: "With clinician",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatQueueStageLabel(stage: string) {
  return QUEUE_STAGE_LABELS[stage] ?? stage.replaceAll("_", " ");
}

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

export function OpdEncounterHeader({
  customer,
  actions,
}: OpdEncounterHeaderProps) {
  const { encounter } = useOpdEncounterWorkspace();
  const fullName = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? "OPD encounter");
  const identiconSeed =
    customer?.uuid ||
    customer?.customer_identifier ||
    encounter?.customer_uuid ||
    encounter?.customer_identifier ||
    fullName;

  const identity = [
    customer?.customer_identifier ?? encounter?.customer_identifier,
    customer?.gender,
    customer ? formatAdaptiveAge(customer.dob) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const meta: Array<{ key: string; label: string; value: string }> = [];

  if (encounter?.department_name) {
    meta.push({
      key: "department",
      label: "Department",
      value: encounter.department_name,
    });
  }
  if (encounter?.clinic_name) {
    meta.push({
      key: "clinic",
      label: "Clinic",
      value: encounter.clinic_name,
    });
  }
  if (encounter?.queue_stage) {
    meta.push({
      key: "queue-stage",
      label: "Queue",
      value: formatQueueStageLabel(encounter.queue_stage),
    });
  }
  if (typeof encounter?.waiting_minutes === "number") {
    meta.push({
      key: "waiting",
      label: "Waiting",
      value: `${encounter.waiting_minutes} min`,
    });
  }
  meta.push({
    key: "started",
    label: "Started",
    value: formatStartedLabel(encounter?.started_at),
  });
  if (encounter) {
    meta.push({
      key: "payment",
      label: "Payment",
      value: formatOpdEncounterPaymentLabel(encounter),
    });
  }

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-4 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
        data-testid="opd-encounter-header"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserIdenticon
            seed={identiconSeed}
            name={fullName}
            className="size-10 shrink-0 rounded-lg"
            fallbackClassName="rounded-lg text-sm font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight text-brand-navy">
                {fullName}
              </h1>
              {encounter?.status ? (
                <OpdEncounterStatusBadge status={encounter.status} />
              ) : null}
            </div>
            {identity ? (
              <p className="mt-0.5 truncate text-sm text-dash-muted">
                {identity}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {meta.length > 0 ? (
        <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-brand-slate">
          {meta.map((item) => (
            <span
              key={item.key}
              data-testid={`opd-encounter-fact-${item.key}`}
            >
              <span className="sr-only">{item.label}: </span>
              {item.value}
            </span>
          ))}
        </p>
      ) : null}
    </DetailPageHeaderSection>
  );
}
