"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelRight } from "lucide-react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { FabButton } from "@/components/ui/fab-button";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import {
  DetailPageLayout,
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { CustomerDetailActions } from "@/features/customers/components/detail/CustomerDetailActions";
import { CustomerDetailHeader } from "@/features/customers/components/detail/CustomerDetailHeader";
import { CustomerDetailTabs } from "@/features/customers/components/detail/CustomerDetailTabs";
import { CustomerDetailWorkspaceProvider } from "@/features/customers/components/detail/customer-detail-workspace-context";
import { CustomerSummaryPanel } from "@/features/customers/components/detail/CustomerSummaryPanel";
import { CustomerVisitActionButton } from "@/features/customers/components/detail/CustomerVisitActionButton";
import { UpdateCustomerDialog } from "@/features/customers/components/UpdateCustomerDialog";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { customerHasMasemPayer } from "@/features/customers/utils/customer-has-masm-payer";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { ManageEntityTagsDialog } from "@/features/tags/components/ManageEntityTagsDialog";
import { cn } from "@/lib/utils";

type CustomerDetailPageProps = {
  customerId: string;
  children: React.ReactNode;
};

export function CustomerDetailPage({
  customerId,
  children,
}: CustomerDetailPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [visitsRefreshKey, setVisitsRefreshKey] = useState(0);
  const [billingRefreshKey, setBillingRefreshKey] = useState(0);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [hasMasemPayer, setHasMasemPayer] = useState(false);
  const [isInsuranceReady, setIsInsuranceReady] = useState(false);

  useAppBreadcrumb(customer ? formatCustomerName(customer) : null);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomer() {
      try {
        const data = await fetchCustomer(customerId);
        if (!cancelled) {
          setCustomer(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load client.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  useEffect(() => {
    const customerUuid = customer?.uuid;
    if (!customerUuid) {
      return;
    }

    let cancelled = false;

    async function loadInsurance() {
      try {
        const records = await fetchCustomerInsurance(customerUuid);
        if (!cancelled) {
          setHasMasemPayer(customerHasMasemPayer(records));
        }
      } catch {
        if (!cancelled) {
          setHasMasemPayer(false);
        }
      } finally {
        if (!cancelled) {
          setIsInsuranceReady(true);
        }
      }
    }

    void loadInsurance();

    return () => {
      cancelled = true;
    };
  }, [customer?.uuid]);

  const handleCustomerUpdated = useCallback((updatedCustomer: Customer) => {
    setCustomer(updatedCustomer);
  }, []);

  const handleTagsUpdated = useCallback((tags: Customer["tags"]) => {
    setCustomer((current) => (current ? { ...current, tags } : current));
  }, []);

  const handleVisitChanged = useCallback(
    async (_visit?: CustomerVisit) => {
      setVisitsRefreshKey((current) => current + 1);

      try {
        const updatedCustomer = await fetchCustomer(customerId);
        setCustomer(updatedCustomer);
      } catch {
        // Active tab will still refresh; customer header may be stale until reload.
      }
    },
    [customerId],
  );

  const handleManageTagsClick = useCallback(() => {
    setTagsDialogOpen(true);
  }, []);

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
    <CustomerDetailWorkspaceProvider
      value={{
        customer,
        hasMasemPayer,
        isInsuranceReady,
        visitsRefreshKey,
        billingRefreshKey,
        onUpdateClick: () => setUpdateDialogOpen(true),
        onVisitChanged: () => {
          void handleVisitChanged();
        },
        onOpeningBalanceUpdated: handleCustomerUpdated,
        onBillingUpdated: () =>
          setBillingRefreshKey((current) => current + 1),
        onTagsUpdated: handleTagsUpdated,
      }}
    >
      <DetailPageLayout data-testid="customer-detail-page">
        <CustomerDetailHeader
          customer={customer}
          onManageTagsClick={handleManageTagsClick}
          actions={
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <CustomerDetailActions
                customer={customer}
                onEditDetails={() => setUpdateDialogOpen(true)}
                onScheduleAppointment={() => setAppointmentDialogOpen(true)}
                onCustomerUpdated={handleCustomerUpdated}
              />
              <CustomerVisitActionButton
                customer={customer}
                onVisitChanged={handleVisitChanged}
              />
            </div>
          }
        />
        <DetailPageTabsSection>
          <CustomerDetailTabs
            customer={customer}
            showBenefitsTab={hasMasemPayer}
          />

          <DetailPageMainAsideGrid>
            <DetailPageMainSection>{children}</DetailPageMainSection>

            <CustomerSummaryPanel
              customer={customer}
              onUpdateClick={() => setUpdateDialogOpen(true)}
              billingRefreshKey={billingRefreshKey}
              onOpeningBalanceUpdated={handleCustomerUpdated}
              onBillingUpdated={() =>
                setBillingRefreshKey((current) => current + 1)
              }
              onTagsUpdated={handleTagsUpdated}
              onManageTagsClick={handleManageTagsClick}
              className={cn(!showSummaryPanel && "hidden xl:block")}
            />
          </DetailPageMainAsideGrid>

          <FabButton
            label={
              showSummaryPanel ? "Hide client summary" : "Show client summary"
            }
            icon={PanelRight}
            variant="outline"
            hideFrom="xl"
            className="bg-white"
            onClick={() => setShowSummaryPanel((current) => !current)}
            data-testid="customer-summary-fab"
          />
        </DetailPageTabsSection>
        <ManageEntityTagsDialog
          open={tagsDialogOpen}
          onOpenChange={setTagsDialogOpen}
          entityLabel={formatCustomerName(customer)}
          entityUuid={customer.uuid}
          selectedTags={customer.tags}
          onSaved={handleTagsUpdated}
        />
        <UpdateCustomerDialog
          customer={customer}
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          onUpdated={handleCustomerUpdated}
        />
        <CreateAppointmentDialog
          customer={customer}
          open={appointmentDialogOpen}
          onOpenChange={setAppointmentDialogOpen}
          onCreated={() => setVisitsRefreshKey((current) => current + 1)}
        />
      </DetailPageLayout>
    </CustomerDetailWorkspaceProvider>
  );
}
