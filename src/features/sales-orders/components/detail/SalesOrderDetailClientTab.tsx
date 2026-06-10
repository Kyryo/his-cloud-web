"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { SalesOrderLinkedDetailsTable } from "@/features/sales-orders/components/detail/SalesOrderLinkedDetailsTable";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { getOdooCustomFieldString } from "@/features/sales-orders/utils/format-odoo-custom-field";
import { ROUTES } from "@/constants/routes";

type SalesOrderDetailClientTabProps = {
  order: SalesOrder;
  isActive: boolean;
};

export function SalesOrderDetailClientTab({
  order,
  isActive,
}: SalesOrderDetailClientTabProps) {
  const customerUuid = getOdooCustomFieldString(order.x_hmis_customer_uuid);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadCustomer = useCallback(async () => {
    if (!customerUuid) {
      setCustomer(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const record = await fetchCustomer(customerUuid);
      setCustomer(record);
    } catch (error) {
      setCustomer(null);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load client details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [customerUuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    void loadCustomer();
  }, [isActive, loadCustomer]);

  if (!isActive) {
    return null;
  }

  if (!customerUuid) {
    return (
      <CustomerDetailTabEmptyState
        icon={UserRound}
        title="No client linked"
        description="This sales order is not linked to an HMIS client record yet."
        data-testid="sales-order-client-empty-state"
      />
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
        data-testid="sales-order-client-unavailable-state"
      />
    );
  }

  const fullName = formatCustomerName(customer);

  return (
    <div className="space-y-4" data-testid="sales-order-client-tab">
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
