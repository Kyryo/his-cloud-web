"use client";

import { Stethoscope } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import { fetchVisit } from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderInsuranceLabel } from "@/features/sales-orders/utils/format-sales-order-insurance";

type SalesOrderDetailVisitTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

function formatPaymentMode(mode: CustomerVisit["mode_of_payment"] | undefined) {
  if (!mode) {
    return "—";
  }

  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function SalesOrderDetailVisitTab({
  order,
  isActive,
}: SalesOrderDetailVisitTabProps) {
  const visitUuid = order.visit_uuid?.trim() || null;
  const [visit, setVisit] = useState<CustomerVisit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadVisit = useCallback(async () => {
    if (!visitUuid) {
      setVisit(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const record = await fetchVisit(visitUuid);
      setVisit(record);
    } catch (error) {
      setVisit(null);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load visit details.",
      );
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
      <CustomerDetailTabEmptyState
        icon={Stethoscope}
        title="No visit linked"
        description="This sales order is not linked to an HMIS visit yet."
        data-testid="sales-order-visit-empty-state"
      />
    );
  }

  if (isLoading || (!visit && !loadError)) {
    return <CustomerTabSkeleton rows={5} />;
  }

  if (loadError || !visit) {
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

  const rows = [
    { label: "Consultation service", value: visit.consultation_service_name || "—" },
    {
      label: "Status",
      value: <CustomerVisitStatusBadge status={visit.status} />,
    },
    {
      label: "Visit date",
      value: formatDisplayDateTime(visit.visit_date),
    },
    { label: "Clinic", value: visit.clinic_name || "No clinic" },
    { label: "Payment", value: formatPaymentMode(visit.mode_of_payment) },
    ...(visit.mode_of_payment === "insurance"
      ? [
          {
            label: "Insurance",
            value: formatSalesOrderInsuranceLabel(order),
          },
        ]
      : []),
    { label: "Client", value: visit.customer_name || "—" },
    {
      label: "Client ID",
      value: visit.customer_identifier || "—",
    },
  ];

  return (
    <SalesOrderLinkedDetailsTable
      rows={rows}
      data-testid="sales-order-visit-details-table"
    />
  );
}
