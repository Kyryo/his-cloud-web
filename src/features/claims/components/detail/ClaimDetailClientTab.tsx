"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import { fetchVisit } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { ROUTES } from "@/constants/routes";

type ClaimDetailClientTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

function visitDetailRows(visit: VisitDetail | null) {
  return [
    {
      label: "Visit date",
      value: visit?.visit_date ? formatDisplayDateTime(visit.visit_date) : "—",
    },
    {
      label: "Clinic",
      value: visit?.clinic_name || "—",
    },
    {
      label: "Started by",
      value: visit ? formatVisitStartedBy(visit) : "—",
    },
  ];
}

export function ClaimDetailClientTab({
  claim,
  isActive,
}: ClaimDetailClientTabProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const customerUuid = claim.customer_uuid?.trim() || "";
  const visitUuid = claim.visit_uuid?.trim() || "";

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;
    setHasLoaded(false);

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      const customerPromise = customerUuid
        ? fetchCustomer(customerUuid)
            .then((record) => ({ ok: true as const, record }))
            .catch((error: unknown) => ({
              ok: false as const,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to load client details.",
            }))
        : Promise.resolve(null);

      const visitPromise = visitUuid
        ? fetchVisit(visitUuid)
            .then((record) => record)
            .catch(() => null)
        : Promise.resolve(null);

      const [customerResult, visitResult] = await Promise.all([
        customerPromise,
        visitPromise,
      ]);

      if (cancelled) {
        return;
      }

      if (customerResult === null) {
        setCustomer(null);
        setLoadError(null);
      } else if (customerResult.ok) {
        setCustomer(customerResult.record);
        setLoadError(null);
      } else {
        setCustomer(null);
        setLoadError(customerResult.message);
      }

      setVisit(visitResult);
      setIsLoading(false);
      setHasLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, customerUuid, visitUuid]);

  if (!isActive) {
    return null;
  }

  if (isLoading || !hasLoaded) {
    return <CustomerTabSkeleton rows={7} />;
  }

  if (!customerUuid) {
    return (
      <div className="space-y-4" data-testid="claim-detail-client-visit-tab">
        <SalesOrderLinkedDetailsTable
          rows={[
            { label: "Client", value: claim.customer_name || "—" },
            ...visitDetailRows(visit),
          ]}
        />
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client profile unavailable"
          description="The full client profile could not be loaded for this claim."
          data-testid="claim-detail-client-empty-state"
        />
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="space-y-4" data-testid="claim-detail-client-visit-tab">
        <SalesOrderLinkedDetailsTable rows={visitDetailRows(visit)} />
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client unavailable"
          description={
            loadError ??
            "The linked client could not be loaded. The record may have been removed or you may not have access."
          }
          data-testid="claim-detail-client-unavailable-state"
        />
      </div>
    );
  }

  const fullName = formatCustomerName(customer);

  return (
    <div className="space-y-4" data-testid="claim-detail-client-visit-tab">
      <div className="flex items-center gap-4 rounded-xl border border-brand-border bg-white p-5">
        <ClientAvatar name={fullName} className="size-12 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-brand-navy">
              {fullName}
            </h2>
            <Badge variant="secondary" className="font-normal">
              {customer.gender}
            </Badge>
            {!customer.is_active ? (
              <Badge variant="outline" className="font-normal">
                Inactive
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-xs text-brand-muted">
            {customer.customer_identifier}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={ROUTES.customerDetail(customer.uuid)}>View client</Link>
        </Button>
      </div>

      <SalesOrderLinkedDetailsTable
        rows={[
          { label: "Age", value: formatAdaptiveAge(customer.dob) },
          { label: "Phone", value: customer.phone_number || "—" },
          { label: "Email", value: customer.email || "—" },
          {
            label: "Visit status",
            value: formatCustomerVisitStatusLabel(customer.visit_status),
          },
          ...visitDetailRows(visit),
        ]}
      />
    </div>
  );
}
