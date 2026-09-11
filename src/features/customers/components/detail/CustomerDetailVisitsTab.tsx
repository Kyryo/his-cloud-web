"use client";

import { useCallback, useEffect, useState } from "react";
import { Stethoscope } from "lucide-react";

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
import { cn } from "@/lib/utils";

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

    let cancelled = false;

    async function run() {
      try {
        const records = await fetchCustomerVisits(customer.uuid, { limit: 100 });
        if (!cancelled) {
          setVisits(records);
          setHasLoaded(true);
          setLoadError(null);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load visits.",
          );
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, isActive, refreshKey]);

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
    <div className="space-y-5" data-testid="customer-detail-visits-tab">
      {/* Seamless Cardless Stat Strip */}
      <dl className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {/* 1. Total Visits */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-blue-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Total visits
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(totalVisits)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Recorded client visits</p>
        </div>

        {/* 2. Active Visits */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            {activeVisits > 0 ? (
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="size-2 shrink-0 rounded-full bg-slate-300" />
            )}
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Active visits
            </dt>
          </div>
          <dd
            className={cn(
              "mt-1 text-lg font-semibold tracking-tight tabular-nums",
              activeVisits > 0 ? "text-emerald-700" : "text-brand-navy",
            )}
          >
            {formatCompactNumber(activeVisits)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">
            {activeVisits > 0 ? (
              <span className="font-medium text-emerald-700">Currently in clinic</span>
            ) : (
              "None in progress"
            )}
          </p>
        </div>

        {/* 3. Completed Visits */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-teal-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Completed
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(completedVisits)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Discharged encounters</p>
        </div>

        {/* 4. Cancelled Visits */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-slate-400" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Cancelled
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {formatCompactNumber(cancelledVisits)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Voided encounters</p>
        </div>
      </dl>

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
