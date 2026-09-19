"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OpdEncounterBillingModeControl } from "@/features/clinical-opd/components/detail/OpdEncounterBillingModeControl";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { ROUTES } from "@/constants/routes";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { opdEncounterTabHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { cn } from "@/lib/utils";

type OpdEncounterSummaryPanelProps = {
  customer: Customer | null;
  className?: string;
  variant?: "aside" | "tab";
  "data-testid"?: string;
};

export function OpdEncounterSummaryPanel({
  customer,
  className,
  variant = "aside",
  "data-testid": dataTestId = "opd-encounter-summary-panel",
}: OpdEncounterSummaryPanelProps) {
  const { encounter, visitUuid, encounterUuid, chartSummary, visibleTabIds } =
    useOpdEncounterWorkspace();
  const isTab = variant === "tab";
  const fullName = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? "—");
  const lastComplaints = chartSummary?.last_chief_complaints ?? [];
  const lastHpis = chartSummary?.last_hpis ?? [];
  const problems = (chartSummary?.problem_list ?? []).filter(
    (item) => item.status !== "inactive" && item.status !== "resolved",
  );
  const currentMedications = (chartSummary?.current_medications ?? []).filter(
    (medication) => medication.status === "active",
  );
  const openOrders = [
    ...(chartSummary?.open_orders ?? []),
    ...(chartSummary?.investigation_orders ?? []),
  ].filter((order) => order.status !== "CANCELLED");

  return (
    <aside
      className={cn(
        isTab
          ? "bg-white"
          : [
              "border-t border-dash-border/70 px-4 py-6 sm:px-6",
              "xl:border-l xl:border-t-0 xl:px-6 xl:pt-5 xl:pb-6",
            ],
        className,
      )}
      data-testid={dataTestId}
    >
      <div className={cn("space-y-7", !isTab && "xl:sticky xl:top-4")}>
        {isTab ? (
          <ContextBlock title="Client">
            <p className="text-sm font-medium text-brand-navy">{fullName}</p>
            {customer ? (
              <>
                <p className="text-sm text-brand-slate">
                  {customer.customer_identifier}
                </p>
                {customer.phone_number ? (
                  <a
                    href={`tel:${customer.phone_number}`}
                    className="text-sm text-brand-slate hover:underline"
                  >
                    {customer.phone_number}
                  </a>
                ) : null}
                <p className="text-sm text-brand-slate">
                  {customer.gender} · {formatAdaptiveAge(customer.dob)}
                </p>
                <p className="text-sm text-brand-slate">
                  {formatDisplayDate(customer.dob)}
                  {customer.dob_is_estimated ? " (estimated)" : ""}
                </p>
                <Button
                  asChild
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-0 text-sm text-brand-primary hover:bg-transparent"
                >
                  <Link
                    href={ROUTES.customerDetail(customer.uuid)}
                    data-testid="opd-encounter-view-client-button"
                  >
                    Open full record
                  </Link>
                </Button>
              </>
            ) : null}
          </ContextBlock>
        ) : null}
        {lastComplaints.length > 0 ? (
          <ContextBlock
            title="Previous visit"
            href={
              visibleTabIds.includes("complaint")
                ? opdEncounterTabHref(visitUuid, encounterUuid, "complaint")
                : undefined
            }
          >
            {lastComplaints.map((complaint) => (
              <p key={complaint.uuid} className="text-sm text-brand-navy">
                {complaint.text}
              </p>
            ))}
            {lastHpis.map((hpi) => (
              <p
                key={hpi.uuid}
                className="line-clamp-4 text-sm text-brand-slate"
              >
                {hpi.body}
              </p>
            ))}
          </ContextBlock>
        ) : null}

        {problems.length > 0 ? (
          <ContextBlock
            title="Problems"
            href={
              visibleTabIds.includes("problems")
                ? opdEncounterTabHref(visitUuid, encounterUuid, "problems")
                : undefined
            }
          >
            {problems.map((problem) => (
              <p key={problem.uuid} className="text-sm text-brand-navy">
                {problem.description}
              </p>
            ))}
          </ContextBlock>
        ) : null}

        {currentMedications.length > 0 ? (
          <ContextBlock
            title="Medications"
            href={
              visibleTabIds.includes("medications")
                ? opdEncounterTabHref(visitUuid, encounterUuid, "medications")
                : undefined
            }
          >
            {currentMedications.map((medication) => (
              <p key={medication.uuid} className="text-sm text-brand-navy">
                {[medication.name, medication.dose, medication.frequency]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ))}
          </ContextBlock>
        ) : null}

        {openOrders.length > 0 ? (
          <ContextBlock
            title="Open orders"
            href={
              visibleTabIds.includes("orders")
                ? opdEncounterTabHref(visitUuid, encounterUuid, "orders")
                : undefined
            }
          >
            {openOrders.map((order) => (
              <p key={order.uuid} className="text-sm text-brand-navy">
                {order.description || order.item_type_display}
              </p>
            ))}
          </ContextBlock>
        ) : null}

        <ContextBlock title="Visit">
          {encounter?.started_at ? (
            <p className="text-sm text-brand-slate">
              {formatDisplayDateTime(encounter.started_at)}
            </p>
          ) : (
            <p className="text-sm text-dash-muted">Not started</p>
          )}
          <OpdEncounterBillingModeControl
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
          />
        </ContextBlock>
      </div>
    </aside>
  );
}

function ContextBlock({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-xs text-brand-primary hover:underline"
          >
            Open
          </Link>
        ) : null}
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}
