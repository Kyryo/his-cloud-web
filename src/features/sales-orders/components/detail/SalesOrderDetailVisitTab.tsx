"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { DetailPageAsideSummaryField } from "@/features/app-shell/components/page-layout";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { fetchVisit } from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import {
  formatVisitPaymentLabel,
  formatVisitSchemeLabel,
} from "@/features/customers/utils/format-visit-scheme";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderInsuranceNumber } from "@/features/sales-orders/utils/format-sales-order-insurance";
import type { VisitEncounter } from "@/features/visits/types/visit.types";

type SalesOrderDetailVisitTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

function formatEncounterStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatEncounterBilling(mode: VisitEncounter["billing_mode"]) {
  return mode === "separate_department"
    ? "Billed separately"
    : "Shared visit bill";
}

function VisitTabSkeleton() {
  return (
    <div className="space-y-6" data-testid="sales-order-visit-skeleton">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 border-t border-dash-border/80 pt-4 sm:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function SalesOrderDetailVisitTab({
  order,
  isActive,
}: SalesOrderDetailVisitTabProps) {
  const visitUuid = order.visit_uuid?.trim() || null;
  const [visit, setVisit] = useState<CustomerVisit | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !visitUuid) {
      return;
    }

    const resolvedVisitUuid = visitUuid;
    let cancelled = false;

    async function loadVisit() {
      try {
        const record = await fetchVisit(resolvedVisitUuid);
        if (!cancelled) {
          setVisit(record);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setVisit(null);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load visit details.",
          );
        }
      }
    }

    void loadVisit();

    return () => {
      cancelled = true;
    };
  }, [isActive, visitUuid]);

  if (!isActive) {
    return null;
  }

  if (!visitUuid) {
    return (
      <CustomerDetailTabEmptyState
        icon={Stethoscope}
        title="No visit linked"
        description="This order is not linked to a clinic visit."
        data-testid="sales-order-visit-empty-state"
      />
    );
  }

  const displayedVisit = visit?.uuid === visitUuid ? visit : null;

  if (loadError && !displayedVisit) {
    return (
      <CustomerDetailTabEmptyState
        icon={Stethoscope}
        title="Visit unavailable"
        description={
          loadError ??
          "The linked visit could not be loaded. It may have been removed or you may not have access."
        }
        data-testid="sales-order-visit-unavailable-state"
      />
    );
  }

  if (!displayedVisit) {
    return <VisitTabSkeleton />;
  }

  const schemeLabel = formatVisitSchemeLabel(displayedVisit);
  const memberNumber = formatSalesOrderInsuranceNumber(order);
  const isInsurance = displayedVisit.mode_of_payment === "insurance";
  const hasPreauth =
    displayedVisit.requires_pre_authorization ||
    Boolean(displayedVisit.pre_authorization_number?.trim());
  const arrivalLabel = displayedVisit.is_walk_in ? "Walk-in" : "From appointment";
  const subtitle = [
    formatDisplayDateTime(displayedVisit.visit_date),
    displayedVisit.clinic_name || "No clinic",
    arrivalLabel,
  ].join(" · ");

  return (
    <div className="space-y-8" data-testid="sales-order-visit-details">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-brand-navy">
              {displayedVisit.consultation_service_name || "Clinic visit"}
            </h2>
            <CustomerVisitStatusBadge status={displayedVisit.status} />
          </div>
          <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
        </div>
        <SecondaryButton asChild className="shrink-0">
          <Link href={ROUTES.visitDetail(displayedVisit.uuid)}>View visit</Link>
        </SecondaryButton>
      </div>

      <dl className="grid gap-4 border-t border-dash-border/80 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailPageAsideSummaryField
          label="Payment"
          value={
            isInsurance && schemeLabel !== "—"
              ? `${formatVisitPaymentLabel(displayedVisit)} · ${schemeLabel}`
              : formatVisitPaymentLabel(displayedVisit)
          }
        />
        <DetailPageAsideSummaryField
          label="Client"
          value={
            <span className="flex flex-col gap-0.5">
              <Link
                href={ROUTES.customerDetail(displayedVisit.customer)}
                className="font-medium text-brand-navy underline-offset-4 hover:underline"
              >
                {displayedVisit.customer_name || "—"}
              </Link>
              <span className="font-mono text-xs text-brand-muted">
                {displayedVisit.customer_identifier || "—"}
              </span>
            </span>
          }
        />
        <DetailPageAsideSummaryField
          label="Started by"
          value={formatVisitStartedBy(displayedVisit)}
        />
        {isInsurance && memberNumber !== "—" ? (
          <DetailPageAsideSummaryField
            label="Member number"
            value={memberNumber}
          />
        ) : null}
        {hasPreauth ? (
          <DetailPageAsideSummaryField
            label="Pre-authorization"
            value={
              displayedVisit.pre_authorization_number?.trim() ||
              (displayedVisit.requires_pre_authorization ? "Required" : "—")
            }
          />
        ) : null}
      </dl>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
            Encounters
          </h3>
          {displayedVisit.encounters.length > 0 ? (
            <p className="text-xs text-brand-muted">
              {displayedVisit.encounters.length}{" "}
              {displayedVisit.encounters.length === 1
                ? "department"
                : "departments"}
            </p>
          ) : null}
        </div>

        {displayedVisit.encounters.length === 0 ? (
          <p className="text-sm text-brand-muted">
            No department encounters recorded on this visit.
          </p>
        ) : (
          <ul className="divide-y divide-dash-border/60">
            {displayedVisit.encounters.map((encounter) => (
              <li
                key={encounter.uuid}
                className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-navy">
                    {encounter.department_name}
                  </p>
                  <p className="mt-0.5 text-sm text-brand-muted">
                    {[
                      encounter.clinician_name || "Unassigned clinician",
                      encounter.location_name || "No location",
                      formatEncounterBilling(encounter.billing_mode),
                    ].join(" · ")}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize font-normal">
                  {formatEncounterStatus(encounter.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
