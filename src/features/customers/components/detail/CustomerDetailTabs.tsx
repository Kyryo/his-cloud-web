"use client";

import { PanelRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { CustomerDetailAddressesTab } from "@/features/customers/components/detail/CustomerDetailAddressesTab";
import { CustomerDetailBenefitsTab } from "@/features/customers/components/detail/CustomerDetailBenefitsTab";
import { CustomerDetailInsuranceTab } from "@/features/customers/components/detail/CustomerDetailInsuranceTab";
import { CustomerDetailInvoicesTab } from "@/features/customers/components/detail/CustomerDetailInvoicesTab";
import { CustomerDetailLegalGuardiansTab } from "@/features/customers/components/detail/CustomerDetailLegalGuardiansTab";
import { CustomerDetailNotesTab } from "@/features/customers/components/detail/CustomerDetailNotesTab";
import { CustomerDetailPaymentsTab } from "@/features/customers/components/detail/CustomerDetailPaymentsTab";
import { CustomerDetailSalesOrdersTab } from "@/features/customers/components/detail/CustomerDetailSalesOrdersTab";
import { CustomerDetailSummaryTab } from "@/features/customers/components/detail/CustomerDetailSummaryTab";
import { CustomerDetailVisitsTab } from "@/features/customers/components/detail/CustomerDetailVisitsTab";
import { CustomerDetailAppointmentsTab } from "@/features/appointments/components/detail/CustomerDetailAppointmentsTab";
import { CustomerSummaryPanel } from "@/features/customers/components/detail/CustomerSummaryPanel";
import { fetchCustomerInsurance } from "@/features/customers/services/customer-insurance.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { customerHasMasemPayer } from "@/features/customers/utils/customer-has-masm-payer";
import type { Tag } from "@/features/tags/types/tag.types";
import { cn } from "@/lib/utils";

type CustomerDetailTabsProps = {
  customer: Customer;
  onUpdateClick: () => void;
  visitsRefreshKey?: number;
  billingRefreshKey?: number;
  onVisitChanged?: () => void;
  onOpeningBalanceUpdated?: (customer: Customer) => void;
  onBillingUpdated?: () => void;
  onTagsUpdated?: (tags: Tag[]) => void;
};

type DetailTabId =
  | "summary"
  | "orders"
  | "invoices"
  | "payments"
  | "visits"
  | "insurance"
  | "benefits"
  | "addresses"
  | "legal-guardians"
  | "appointments"
  | "notes";

const tabs: Array<{
  id: DetailTabId;
  label: string;
}> = [
  { id: "summary", label: "Summary" },
  { id: "orders", label: "Sales Orders" },
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "visits", label: "Visits" },
  { id: "insurance", label: "Insurance" },
  { id: "benefits", label: "Benefits" },
  { id: "addresses", label: "Address" },
  { id: "legal-guardians", label: "Legal guardians" },
  { id: "appointments", label: "Appointments" },
  { id: "notes", label: "Notes" },
];

export function CustomerDetailTabs({
  customer,
  onUpdateClick,
  visitsRefreshKey = 0,
  billingRefreshKey = 0,
  onVisitChanged,
  onOpeningBalanceUpdated,
  onBillingUpdated,
  onTagsUpdated,
}: CustomerDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("summary");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [hasMasemPayer, setHasMasemPayer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchCustomerInsurance(customer.uuid)
      .then((records) => {
        if (!cancelled) {
          setHasMasemPayer(customerHasMasemPayer(records));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasMasemPayer(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [customer.uuid]);

  useEffect(() => {
    if (activeTab === "benefits" && !hasMasemPayer) {
      setActiveTab("summary");
    }
  }, [activeTab, hasMasemPayer]);

  const visibleTabs = tabs.filter(
    (tab) => tab.id !== "benefits" || hasMasemPayer,
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Client sections">
        {visibleTabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          <CustomerDetailSummaryTab
            customer={customer}
            isActive={activeTab === "summary"}
            billingRefreshKey={billingRefreshKey}
          />
          <CustomerDetailSalesOrdersTab
            customer={customer}
            isActive={activeTab === "orders"}
            refreshKey={visitsRefreshKey}
          />
          <CustomerDetailInvoicesTab
            customer={customer}
            isActive={activeTab === "invoices"}
          />
          <CustomerDetailPaymentsTab
            customer={customer}
            isActive={activeTab === "payments"}
          />
          <CustomerDetailVisitsTab
            customer={customer}
            isActive={activeTab === "visits"}
            refreshKey={visitsRefreshKey}
          />
          <CustomerDetailInsuranceTab
            customer={customer}
            isActive={activeTab === "insurance"}
          />
          <CustomerDetailBenefitsTab
            customer={customer}
            isActive={activeTab === "benefits"}
            emptyStateIcon={ShieldCheck}
          />
          <CustomerDetailAddressesTab
            customer={customer}
            isActive={activeTab === "addresses"}
          />
          <CustomerDetailLegalGuardiansTab
            customer={customer}
            isActive={activeTab === "legal-guardians"}
          />
          <CustomerDetailAppointmentsTab
            customer={customer}
            isActive={activeTab === "appointments"}
            refreshKey={visitsRefreshKey}
            onVisitStarted={onVisitChanged}
          />
          <CustomerDetailNotesTab
            customer={customer}
            isActive={activeTab === "notes"}
          />
        </DetailPageMainSection>

        <CustomerSummaryPanel
          customer={customer}
          onUpdateClick={onUpdateClick}
          billingRefreshKey={billingRefreshKey}
          onOpeningBalanceUpdated={onOpeningBalanceUpdated}
          onBillingUpdated={onBillingUpdated}
          onTagsUpdated={onTagsUpdated}
          className={cn(!showSummaryPanel && "hidden xl:block")}
        />
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide client summary" : "Show client summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
        data-testid="customer-summary-fab"
      />
    </DetailPageTabsSection>
  );
}
