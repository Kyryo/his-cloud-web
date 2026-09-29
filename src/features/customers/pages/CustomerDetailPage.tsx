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
  DetailPageNotFound,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import {
  ACTIVE_CLINIC_CHANGE_EVENT,
  readActiveClinicId,
} from "@/features/app-shell/utils/active-clinic";
import { fetchClinicalDepartments } from "@/features/clinical/services/clinical-catalog.service";
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
import { useUser } from "@/providers/user-provider";

const OH_DEPARTMENT_TYPE = "occupational_health";

type CustomerDetailPageProps = {
  customerId: string;
  children: React.ReactNode;
};

export function CustomerDetailPage({
  customerId,
  children,
}: CustomerDetailPageProps) {
  const { userData } = useUser();
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
  const [showEmploymentTab, setShowEmploymentTab] = useState(false);
  const [isEmploymentReady, setIsEmploymentReady] = useState(false);
  const [activeClinicId, setActiveClinicId] = useState<number | null>(() =>
    readActiveClinicId(),
  );

  useAppBreadcrumb(customer ? formatCustomerName(customer) : null);

  useEffect(() => {
    const fallbackClinicId =
      userData?.clinics?.find((clinic) => clinic.is_primary && clinic.is_active)
        ?.clinic ??
      userData?.clinics?.find((clinic) => clinic.is_active)?.clinic ??
      userData?.primary_clinic?.id ??
      null;

    setActiveClinicId((current) => current ?? fallbackClinicId);
  }, [userData]);

  useEffect(() => {
    function handleClinicChange(event: Event) {
      const clinicId = (event as CustomEvent<number>).detail;
      if (Number.isInteger(clinicId) && clinicId > 0) {
        setActiveClinicId(clinicId);
      }
    }

    window.addEventListener(ACTIVE_CLINIC_CHANGE_EVENT, handleClinicChange);
    return () => {
      window.removeEventListener(ACTIVE_CLINIC_CHANGE_EVENT, handleClinicChange);
    };
  }, []);

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
    if (!customer?.uuid) {
      return;
    }

    const customerUuid = customer.uuid;
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

  useEffect(() => {
    let cancelled = false;
    setIsEmploymentReady(false);

    async function loadEmploymentAvailability() {
      if (!activeClinicId) {
        if (!cancelled) {
          setShowEmploymentTab(false);
          setIsEmploymentReady(true);
        }
        return;
      }

      try {
        const departments = await fetchClinicalDepartments(activeClinicId);
        if (!cancelled) {
          setShowEmploymentTab(
            departments.some(
              (department) =>
                department.department_type === OH_DEPARTMENT_TYPE &&
                department.is_active,
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setShowEmploymentTab(false);
        }
      } finally {
        if (!cancelled) {
          setIsEmploymentReady(true);
        }
      }
    }

    void loadEmploymentAvailability();

    return () => {
      cancelled = true;
    };
  }, [activeClinicId]);

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
      <DetailPageNotFound
        title="Client not found"
        message={error ?? "This client record could not be loaded."}
      />
    );
  }

  return (
    <CustomerDetailWorkspaceProvider
      value={{
        customer,
        hasMasemPayer,
        isInsuranceReady,
        showEmploymentTab,
        isEmploymentReady,
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
            <CustomerDetailActions
              customer={customer}
              onEditDetails={() => setUpdateDialogOpen(true)}
              onScheduleAppointment={() => setAppointmentDialogOpen(true)}
              onCustomerUpdated={handleCustomerUpdated}
            >
              <CustomerVisitActionButton
                customer={customer}
                onVisitChanged={handleVisitChanged}
              />
            </CustomerDetailActions>
          }
        />
        <DetailPageTabsSection>
          <CustomerDetailTabs
            customer={customer}
            showBenefitsTab={hasMasemPayer}
            showEmploymentTab={showEmploymentTab}
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
          onCreated={() => {
            setVisitsRefreshKey((current) => current + 1);
          }}
        />
      </DetailPageLayout>
    </CustomerDetailWorkspaceProvider>
  );
}
