"use client";

import { Calendar } from "lucide-react";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { formatErpSyncStatus } from "@/features/customers/constants/customer-sync-labels";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
} from "@/features/customers/utils/format-customer";

type CustomerDetailHeaderProps = {
  customer: Customer;
};

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const fullName = formatCustomerName(customer);
  const ageDisplay = formatAdaptiveAge(customer.dob);

  return (
    <DetailPageHeaderSection>
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <ClientAvatar name={fullName} className="size-10 text-sm sm:size-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {fullName}
            </h1>
            <Badge variant={customer.gender === "Male" ? "default" : "secondary"}>
              {customer.gender}
            </Badge>
            {!customer.is_active ? (
              <Badge variant="outline">Inactive</Badge>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
            <span>
              {ageDisplay}
              {customer.dob_is_estimated ? " (estimated)" : ""}
            </span>
            <span className="font-mono text-xs text-brand-slate">
              {customer.customer_identifier}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Registered {formatDisplayDate(customer.created_at)}
            </span>
            <span>{formatErpSyncStatus(customer.has_synced_to_odoo)}</span>
          </div>
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
