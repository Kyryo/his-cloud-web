"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import { OpdEncounterBillingModeControl } from "@/features/clinical-opd/components/detail/OpdEncounterBillingModeControl";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { ROUTES } from "@/constants/routes";
import { formatOpdEncounterPaymentLabel } from "@/features/clinical-opd/utils/format-opd-encounter-payment";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
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
  const { encounter, visitUuid, encounterUuid } = useOpdEncounterWorkspace();
  const fullName = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? "—");
  const isTab = variant === "tab";

  return (
    <aside
      className={cn(
        isTab
          ? "rounded-xl border border-dash-border/80 bg-white px-4 py-5 sm:px-5"
          : [
              "border-t border-dash-border/80 bg-white px-4 py-5 sm:px-6",
              "xl:border-l xl:border-t-0 xl:px-5 xl:pt-3 xl:pb-5",
            ],
        className,
      )}
      data-testid={dataTestId}
    >
      <div className={cn("space-y-4", !isTab && "xl:sticky xl:top-4")}>
        <DetailPageAsidePanelHeader
          title={isTab ? "Client & visit" : "Encounter summary"}
          description={
            isTab
              ? "Client profile and current outpatient visit details"
              : "Current outpatient visit details"
          }
        />

        <DetailPageAsideSummarySection title="Encounter" className="border-t-0 pt-0">
          <DetailPageAsideSummaryField
            label="Status"
            value={
              encounter?.status ? (
                <OpdEncounterStatusBadge status={encounter.status} />
              ) : (
                "—"
              )
            }
          />
          <DetailPageAsideSummaryField
            label="Department"
            value={encounter?.department_name ?? "—"}
          />
          <DetailPageAsideSummaryField
            label="Started"
            value={
              encounter?.started_at
                ? formatDisplayDateTime(encounter.started_at)
                : "—"
            }
          />
          <DetailPageAsideSummaryField
            label="Payment"
            value={encounter ? formatOpdEncounterPaymentLabel(encounter) : "—"}
          />
          <DetailPageAsideSummaryField
            label="Billing mode"
            value={
              <OpdEncounterBillingModeControl
                visitUuid={visitUuid}
                encounterUuid={encounterUuid}
              />
            }
          />
          <DetailPageAsideSummaryField
            label="Visit UUID"
            value={
              <span className="break-all font-mono text-xs text-brand-muted">
                {visitUuid}
              </span>
            }
          />
          <DetailPageAsideSummaryField
            label="Encounter UUID"
            value={
              <span className="break-all font-mono text-xs text-brand-muted">
                {encounterUuid}
              </span>
            }
          />
        </DetailPageAsideSummarySection>

        <DetailPageAsideSummarySection
          title="Client"
          action={
            customer ? (
              <Button
                asChild
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
              >
                <Link
                  href={ROUTES.customerDetail(customer.uuid)}
                  data-testid="opd-encounter-view-client-button"
                >
                  <span className="inline-flex items-center gap-1">
                    View client
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
            ) : null
          }
        >
          <DetailPageAsideSummaryField label="Name" value={fullName} />
          {customer ? (
            <>
              <DetailPageAsideSummaryField
                label="Client ID"
                value={
                  <span className="inline-flex items-center rounded border border-dash-border/80 bg-dash-canvas px-1.5 py-0.5 font-mono text-xs font-semibold text-brand-navy">
                    {customer.customer_identifier}
                  </span>
                }
              />
              <DetailPageAsideSummaryField
                label="Phone"
                value={
                  customer.phone_number ? (
                    <a
                      href={`tel:${customer.phone_number}`}
                      className="text-brand-slate hover:text-brand-navy hover:underline"
                    >
                      {customer.phone_number}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailPageAsideSummaryField
                label="Email"
                value={
                  customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="break-all text-brand-slate hover:text-brand-navy hover:underline"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailPageAsideSummaryField label="Gender" value={customer.gender} />
              <DetailPageAsideSummaryField
                label="Date of birth"
                value={
                  <>
                    {formatDisplayDate(customer.dob)}
                    {customer.dob_is_estimated ? (
                      <span className="ml-1 text-xs text-brand-muted">
                        (estimated)
                      </span>
                    ) : null}
                  </>
                }
              />
              <DetailPageAsideSummaryField
                label="Age"
                value={formatAdaptiveAge(customer.dob)}
              />
            </>
          ) : null}
        </DetailPageAsideSummarySection>
      </div>
    </aside>
  );
}
