"use client";

import { CustomerEmploymentEpisodesSection } from "@/features/occupational-health/components/CustomerEmploymentEpisodesSection";
import type { Customer } from "@/features/customers/types/customer.types";

type CustomerDetailEmploymentTabProps = {
  customer: Customer;
  isActive: boolean;
};

export function CustomerDetailEmploymentTab({
  customer,
  isActive,
}: CustomerDetailEmploymentTabProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="customer-employment-tab">
      <CustomerEmploymentEpisodesSection customer={customer} isActive={isActive} />
    </div>
  );
}
