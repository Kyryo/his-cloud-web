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
} from "@/features/customers/utils/format-customer";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import { ROUTES } from "@/constants/routes";

type ClaimDetailClientTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

export function ClaimDetailClientTab({
  claim,
  isActive,
}: ClaimDetailClientTabProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const customerUuid = claim.customer_uuid?.trim();
    if (!customerUuid) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const record = await fetchCustomer(customerUuid);
        if (!cancelled) {
          setCustomer(record);
        }
      } catch (error) {
        if (!cancelled) {
          setCustomer(null);
          setLoadError(
            error instanceof Error ? error.message : "Failed to load client details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, claim.customer_uuid]);

  if (!isActive) {
    return null;
  }

  if (!claim.customer_uuid?.trim()) {
    return (
      <div className="space-y-4" data-testid="claim-detail-client-tab">
        <SalesOrderLinkedDetailsTable
          rows={[
            { label: "Client", value: claim.customer_name || "—" },
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

  if (isLoading || (!customer && !loadError)) {
    return <CustomerTabSkeleton rows={4} />;
  }

  if (loadError || !customer) {
    return (
      <CustomerDetailTabEmptyState
        icon={UserRound}
        title="Client unavailable"
        description={
          loadError ??
          "The linked client could not be loaded. The record may have been removed or you may not have access."
        }
        data-testid="claim-detail-client-unavailable-state"
      />
    );
  }

  const fullName = formatCustomerName(customer);

  return (
    <div className="space-y-4" data-testid="claim-detail-client-tab">
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
        ]}
      />
    </div>
  );
}
