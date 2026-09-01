"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { CustomerDetailAppointmentsTab } from "@/features/appointments/components/detail/CustomerDetailAppointmentsTab";
import { CustomerDetailAddressesTab } from "@/features/customers/components/detail/CustomerDetailAddressesTab";
import { CustomerDetailBenefitsTab } from "@/features/customers/components/detail/CustomerDetailBenefitsTab";
import { useCustomerDetailWorkspace } from "@/features/customers/components/detail/customer-detail-workspace-context";
import { CustomerDetailInsuranceTab } from "@/features/customers/components/detail/CustomerDetailInsuranceTab";
import { CustomerDetailInvoicesTab } from "@/features/customers/components/detail/CustomerDetailInvoicesTab";
import { CustomerDetailLegalGuardiansTab } from "@/features/customers/components/detail/CustomerDetailLegalGuardiansTab";
import { CustomerDetailNotesTab } from "@/features/customers/components/detail/CustomerDetailNotesTab";
import { CustomerDetailPaymentsTab } from "@/features/customers/components/detail/CustomerDetailPaymentsTab";
import { CustomerDetailSalesOrdersTab } from "@/features/customers/components/detail/CustomerDetailSalesOrdersTab";
import { CustomerDetailSummaryTab } from "@/features/customers/components/detail/CustomerDetailSummaryTab";
import { CustomerDetailVisitsTab } from "@/features/customers/components/detail/CustomerDetailVisitsTab";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import type { CustomerDetailTabId } from "@/features/customers/utils/customer-detail-tabs";
import { customerDetailTabHref } from "@/features/customers/utils/customer-detail-tabs";

type CustomerDetailTabPageProps = {
  tab: CustomerDetailTabId;
};

export function CustomerDetailTabPage({ tab }: CustomerDetailTabPageProps) {
  const router = useRouter();
  const {
    customer,
    hasMasemPayer,
    isInsuranceReady,
    visitsRefreshKey,
    billingRefreshKey,
    onVisitChanged,
  } = useCustomerDetailWorkspace();

  const shouldRedirectBenefits =
    tab === "benefits" && isInsuranceReady && !hasMasemPayer;

  useEffect(() => {
    if (!shouldRedirectBenefits) {
      return;
    }

    router.replace(customerDetailTabHref(customer.uuid));
  }, [customer.uuid, router, shouldRedirectBenefits]);

  if (tab === "benefits" && (!isInsuranceReady || !hasMasemPayer)) {
    return <CustomerTabSkeleton />;
  }

  switch (tab) {
    case "summary":
      return (
        <CustomerDetailSummaryTab
          customer={customer}
          isActive
          billingRefreshKey={billingRefreshKey}
        />
      );
    case "orders":
      return (
        <CustomerDetailSalesOrdersTab
          customer={customer}
          isActive
          refreshKey={visitsRefreshKey}
        />
      );
    case "invoices":
      return <CustomerDetailInvoicesTab customer={customer} isActive />;
    case "payments":
      return <CustomerDetailPaymentsTab customer={customer} isActive />;
    case "visits":
      return (
        <CustomerDetailVisitsTab
          customer={customer}
          isActive
          refreshKey={visitsRefreshKey}
        />
      );
    case "insurance":
      return <CustomerDetailInsuranceTab customer={customer} isActive />;
    case "benefits":
      return (
        <CustomerDetailBenefitsTab
          customer={customer}
          isActive
          emptyStateIcon={ShieldCheck}
        />
      );
    case "addresses":
      return <CustomerDetailAddressesTab customer={customer} isActive />;
    case "legal-guardians":
      return <CustomerDetailLegalGuardiansTab customer={customer} isActive />;
    case "appointments":
      return (
        <CustomerDetailAppointmentsTab
          customer={customer}
          isActive
          refreshKey={visitsRefreshKey}
          onVisitStarted={onVisitChanged}
        />
      );
    case "notes":
      return <CustomerDetailNotesTab customer={customer} isActive />;
  }
}
