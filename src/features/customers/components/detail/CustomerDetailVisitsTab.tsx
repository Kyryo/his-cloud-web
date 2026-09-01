"use client";

import { useCallback, useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { CustomerVisitsTable } from "@/features/customers/components/detail/CustomerVisitsTable";
import {
  countActiveCustomerVisits,
  countCancelledCustomerVisits,
  countCompletedCustomerVisits,
  countCustomerVisits,
  fetchCustomerVisits,
} from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { EditVisitPaymentDialog } from "@/features/visits/components/EditVisitPaymentDialog";
import { VisitDetailDialog } from "@/features/visits/components/VisitDetailDialog";
import { formatCompactNumber } from "@/utils/format-compact-number";

const VISIT_STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerDetailVisitsTabProps = {
  customer: Customer;
  isActive: boolean;
  refreshKey?: number;
};

export function CustomerDetailVisitsTab({
  customer,
  isActive,
  refreshKey = 0,
}: CustomerDetailVisitsTabProps) {
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedVisitUuid, setSelectedVisitUuid] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<CustomerVisit | null>(null);

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
    return <CustomerTabSkeleton statCards={4} rows={5} />;
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
  const cancelledVisits = countCancelledCustomerVisits(visits);

  const dialogs = (
    <>
      <VisitDetailDialog
        visitUuid={selectedVisitUuid}
        open={Boolean(selectedVisitUuid)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVisitUuid(null);
          }
        }}
        onVisitUpdated={() => void loadVisits()}
      />
      {editingVisit ? (
        <EditVisitPaymentDialog
          visit={editingVisit}
          open={Boolean(editingVisit)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingVisit(null);
            }
          }}
          onUpdated={(updatedVisit) => {
            setVisits((current) =>
              current.map((visit) =>
                visit.uuid === updatedVisit.uuid ? updatedVisit : visit,
              ),
            );
            setEditingVisit(null);
          }}
        />
      ) : null}
    </>
  );

  return (
    <div className="space-y-4" data-testid="customer-detail-visits-tab">
      <StatsCard1Grid>
        <StatsCard1
          className={VISIT_STAT_CARD_CLASS}
          title="Total visits"
          value={formatCompactNumber(totalVisits)}
        />
        <StatsCard1
          className={VISIT_STAT_CARD_CLASS}
          title="Active"
          value={formatCompactNumber(activeVisits)}
        />
        <StatsCard1
          className={VISIT_STAT_CARD_CLASS}
          title="Completed"
          value={formatCompactNumber(completedVisits)}
        />
        <StatsCard1
          className={VISIT_STAT_CARD_CLASS}
          title="Cancelled"
          value={formatCompactNumber(cancelledVisits)}
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
        <CustomerVisitsTable
          visits={visits}
          onEdit={setEditingVisit}
          onView={(visit) => setSelectedVisitUuid(visit.uuid)}
        />
      )}

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
      {dialogs}
    </div>
  );
}
