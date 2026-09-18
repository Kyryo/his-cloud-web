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

type EncounterFact = {
  key: string;
  label: string;
  value: string;
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

  const facts: EncounterFact[] = [];

  if (encounter?.department_name) {
    facts.push({
      key: "department",
      label: "Department",
      value: encounter.department_name,
    });
  }

  if (encounter?.clinic_name) {
    facts.push({
      key: "clinic",
      label: "Clinic",
      value: encounter.clinic_name,
    });
  }

  if (encounter?.queue_stage) {
    facts.push({
      key: "queue-stage",
      label: "Queue",
      value: formatQueueStageLabel(encounter.queue_stage),
    });
  }

  if (typeof encounter?.waiting_minutes === "number") {
    facts.push({
      key: "waiting",
      label: "Waiting",
      value: `${encounter.waiting_minutes} min`,
    });
  }

  facts.push({
    key: "started",
    label: "Started",
    value: formatStartedLabel(encounter?.started_at),
  });

  if (encounter) {
    facts.push({
      key: "payment",
      label: "Payment",
      value: formatOpdEncounterPaymentLabel(encounter),
    });
  }

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-6 sm:px-6">
      <div
        className="flex flex-wrap items-start justify-between gap-5"
        data-testid="opd-encounter-header"
      >
        <div className="flex min-w-0 items-start gap-4">
          <UserIdenticon
            seed={identiconSeed}
            name={fullName}
            className="size-14 shrink-0 rounded-2xl"
            fallbackClassName="rounded-2xl text-base font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-brand-navy">
                {fullName}
              </h1>
              {encounter?.status ? (
                <OpdEncounterStatusBadge status={encounter.status} />
              ) : null}
            </div>
            {identity ? (
              <p className="mt-1.5 truncate text-sm text-dash-muted">
                {identity}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {facts.length > 0 ? (
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-dash-border/70 pt-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div
              key={fact.key}
              data-testid={`opd-encounter-fact-${fact.key}`}
            >
              <dt className="text-xs text-dash-muted">{fact.label}</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </DetailPageHeaderSection>
  );
}
