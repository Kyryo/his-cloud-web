"use client";

import { CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { Button } from "@/components/ui/button";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import { fetchVisit } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { ROUTES } from "@/constants/routes";

type ClaimDetailVisitTabProps = {
  visitUuid: string | null;
  isActive: boolean;
  onOpenVisit?: () => void;
};

export function ClaimDetailVisitTab({
  visitUuid,
  isActive,
  onOpenVisit,
}: ClaimDetailVisitTabProps) {
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVisit = useCallback(async () => {
    if (!visitUuid) {
      setVisit(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVisit(visitUuid);
      setVisit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visit.");
      setVisit(null);
    } finally {
      setIsLoading(false);
    }
  }, [visitUuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadVisit();
  }, [isActive, loadVisit]);

  if (!isActive) {
    return null;
  }

  if (!visitUuid) {
    return (
      <DetailTabEmptyState
        icon={CalendarClock}
        title="No visit linked"
        description="This claim is not linked to a clinic visit."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-1 py-8 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading visit...
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
        {error ?? "Visit could not be loaded."}
      </div>
    );
  }

  return (
    <div data-testid="claim-detail-visit-tab">
      <SalesOrderLinkedDetailsTable
        rows={[
          {
            label: "Visit",
            value: onOpenVisit ? (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-brand-primary"
                onClick={onOpenVisit}
              >
                Open visit
              </Button>
            ) : (
              <Link
                href={ROUTES.visitDetail(visit.uuid)}
                className="text-brand-primary hover:underline"
              >
                Open visit
              </Link>
            ),
          },
          {
            label: "Status",
            value: <CustomerVisitStatusBadge status={visit.status} />,
          },
          {
            label: "Client",
            value: visit.customer ? (
              <Link
                href={ROUTES.customerDetail(visit.customer)}
                className="text-brand-primary hover:underline"
              >
                {visit.customer_name || "—"}
              </Link>
            ) : (
              visit.customer_name || "—"
            ),
          },
          {
            label: "Visit date",
            value: visit.visit_date
              ? formatDisplayDateTime(visit.visit_date)
              : "—",
          },
          {
            label: "Consultation service",
            value: visit.consultation_service_name || "—",
          },
          {
            label: "Clinic",
            value: visit.clinic_name || "—",
          },
          {
            label: "Started by",
            value: formatVisitStartedBy(visit),
          },
        ]}
      />
    </div>
  );
}
