"use client";

import { useCallback, useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import {
  CustomerDetailRecordList,
  CustomerDetailRecordListItem,
} from "@/features/customers/components/detail/CustomerDetailRecordList";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import {
  countActiveCustomerVisits,
  countCompletedCustomerVisits,
  countCustomerVisits,
  fetchCustomerVisits,
} from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatCompactNumber } from "@/utils/format-compact-number";

type CustomerDetailVisitsTabProps = {
  customer: Customer;
  isActive: boolean;
  refreshKey?: number;
};

function formatPaymentMode(mode: CustomerVisit["mode_of_payment"]) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function CustomerDetailVisitsTab({
  customer,
  isActive,
  refreshKey = 0,
}: CustomerDetailVisitsTabProps) {
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadVisits = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const records = await fetchCustomerVisits(customer.uuid, { limit: 100 });
      setVisits(records);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load visits.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customer.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadVisits();
  }, [isActive, loadVisits, refreshKey]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={3} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  const totalVisits = countCustomerVisits(visits);
  const activeVisits = countActiveCustomerVisits(visits);
  const completedVisits = countCompletedCustomerVisits(visits);

  return (
    <div className="space-y-4" data-testid="customer-detail-visits-tab">
      <StatsCard1Grid>
        <StatsCard1
          title="Total visits"
          value={formatCompactNumber(totalVisits)}
        />
        <StatsCard1
          title="Active"
          value={formatCompactNumber(activeVisits)}
        />
        <StatsCard1
          title="Completed"
          value={formatCompactNumber(completedVisits)}
        />
      </StatsCard1Grid>

      {visits.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Stethoscope}
          title="No visits yet"
          description="Start a visit from the header when this client arrives for care."
          data-testid="customer-visits-empty-state"
        />
      ) : (
        <CustomerDetailRecordList
          title="Visit history"
          description="Recent visits for this client, newest first."
          data-testid="customer-visits-list"
        >
          {visits.map((visit) => (
            <CustomerDetailRecordListItem
              key={visit.uuid}
              icon={Stethoscope}
              title={visit.consultation_service_name || "Visit"}
              badges={<CustomerVisitStatusBadge status={visit.status} />}
              description={
                <div className="space-y-0.5">
                  <p>{formatPaymentMode(visit.mode_of_payment)}</p>
                  {visit.clinic_name ? <p>{visit.clinic_name}</p> : null}
                  {visit.requires_pre_authorization ? (
                    <p>Pre-authorization required</p>
                  ) : null}
                </div>
              }
              dateTime={formatDisplayDateTime(visit.visit_date)}
              data-testid={`customer-visit-${visit.uuid}`}
            />
          ))}
        </CustomerDetailRecordList>
      )}

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
    </div>
  );
}
