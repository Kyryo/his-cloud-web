"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { CustomerDetailAddressesTab } from "@/features/customers/components/detail/CustomerDetailAddressesTab";
import { CustomerDetailInsuranceTab } from "@/features/customers/components/detail/CustomerDetailInsuranceTab";
import { CustomerDetailNotesTab } from "@/features/customers/components/detail/CustomerDetailNotesTab";
import { CustomerDetailSalesOrdersTab } from "@/features/customers/components/detail/CustomerDetailSalesOrdersTab";
import { CustomerDetailSummaryTab } from "@/features/customers/components/detail/CustomerDetailSummaryTab";
import { CustomerDetailVisitsTab } from "@/features/customers/components/detail/CustomerDetailVisitsTab";
import { CustomerDetailAppointmentsTab } from "@/features/appointments/components/detail/CustomerDetailAppointmentsTab";
import { CustomerSummaryPanel } from "@/features/customers/components/detail/CustomerSummaryPanel";
import type { Customer } from "@/features/customers/types/customer.types";
import { cn } from "@/lib/utils";

type CustomerDetailTabsProps = {
  customer: Customer;
  onUpdateClick: () => void;
  visitsRefreshKey?: number;
  onVisitChanged?: () => void;
};

type DetailTabId =
  | "summary"
  | "orders"
  | "invoices"
  | "payments"
  | "visits"
  | "insurance"
  | "addresses"
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
  { id: "addresses", label: "Address" },
  { id: "appointments", label: "Appointments" },
  { id: "notes", label: "Notes" },
];

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
      <p className="text-sm font-medium text-brand-navy">{label}</p>
      <p className="mt-2 text-sm text-brand-muted">
        This section is not available yet in the new app. It will be added in a
        future release.
      </p>
    </div>
  );
}

export function CustomerDetailTabs({
  customer,
  onUpdateClick,
  visitsRefreshKey = 0,
  onVisitChanged,
}: CustomerDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("summary");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Client sections">
        {tabs.map((tab) => (
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
          />
          <CustomerDetailSalesOrdersTab
            customer={customer}
            isActive={activeTab === "orders"}
          />
          {activeTab === "invoices" ? (
            <TabPlaceholder label="Invoices" />
          ) : null}
          {activeTab === "payments" ? (
            <TabPlaceholder label="Payments" />
          ) : null}
          <CustomerDetailVisitsTab
            customer={customer}
            isActive={activeTab === "visits"}
            refreshKey={visitsRefreshKey}
          />
          <CustomerDetailInsuranceTab
            customer={customer}
            isActive={activeTab === "insurance"}
          />
          <CustomerDetailAddressesTab
            customer={customer}
            isActive={activeTab === "addresses"}
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
