"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { CustomerDetailHeader } from "@/features/customers/components/detail/CustomerDetailHeader";
import { CustomerDetailTabs } from "@/features/customers/components/detail/CustomerDetailTabs";
import { CustomerVisitActionButton } from "@/features/customers/components/detail/CustomerVisitActionButton";
import { UpdateCustomerDialog } from "@/features/customers/components/UpdateCustomerDialog";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";

type CustomerDetailPageProps = {
  customerId: string;
};

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [visitsRefreshKey, setVisitsRefreshKey] = useState(0);

  useAppBreadcrumb(customer ? formatCustomerName(customer) : null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCustomer(customerId);
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomer();
  }, [customerId]);

  const handleCustomerUpdated = useCallback((updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  }, []);

  const handleVisitChanged = useCallback(
    async (_visit: CustomerVisit) => {
      setVisitsRefreshKey((current) => current + 1);

      try {
        const updatedCustomer = await fetchCustomer(customerId);
        setCustomer(updatedCustomer);
      } catch {
        // Visits tab will still refresh; customer header may be stale until reload.
      }
    },
    [customerId],
  );

  if (isLoading) {
    return (
      <PageLoader
        message="Loading client..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Client not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This client record could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <DetailPageLayout data-testid="customer-detail-page">
      <CustomerDetailHeader
        customer={customer}
        actions={
          <CustomerVisitActionButton
            customer={customer}
            onVisitChanged={handleVisitChanged}
          />
        }
      />
      <CustomerDetailTabs
        customer={customer}
        onUpdateClick={() => setUpdateDialogOpen(true)}
        visitsRefreshKey={visitsRefreshKey}
        onVisitChanged={() => setVisitsRefreshKey((current) => current + 1)}
      />
      <UpdateCustomerDialog
        customer={customer}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onUpdated={handleCustomerUpdated}
      />
    </DetailPageLayout>
  );
}
