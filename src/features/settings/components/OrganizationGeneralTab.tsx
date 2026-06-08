import { Badge } from "@/components/ui/badge";
import { OrganizationContactForm } from "@/features/settings/components/OrganizationContactForm";
import { OrganizationCurrencySection } from "@/features/settings/components/OrganizationCurrencySection";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { SettingsDetailGrid } from "@/features/settings/components/SettingsPageLayout";
import type { TenantDetail } from "@/features/settings/types/settings.types";

type OrganizationGeneralTabProps = {
  tenant: TenantDetail;
  onTenantUpdated: (tenant: TenantDetail) => void;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatStatus(status: string, isActive: boolean) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={isActive ? "default" : "outline"} className="capitalize">
      {label.toLowerCase()}
    </Badge>
  );
}

export function OrganizationGeneralTab({
  tenant,
  onTenantUpdated,
}: OrganizationGeneralTabProps) {
  return (
    <div className="divide-y divide-brand-border">
      <OrganizationTabSection
        title="Organization profile"
        description="Core details for your healthcare organization."
        className="pb-8"
      >
        <SettingsDetailGrid
          tone="panel"
          items={[
            { label: "Name", value: tenant.name },
            { label: "Code", value: tenant.code },
            {
              label: "Status",
              value: formatStatus(tenant.status, tenant.is_active),
            },
            { label: "Country", value: formatValue(tenant.country) },
            {
              label: "Currency",
              value: <OrganizationCurrencySection />,
            },
            { label: "Description", value: formatValue(tenant.description) },
            { label: "Clinics", value: tenant.clinic_count },
            { label: "Locations", value: tenant.location_count },
          ]}
        />
      </OrganizationTabSection>

      <OrganizationTabSection
        title="Contact & address"
        description="These details will appear on invoices, receipts, and other official documents."
        className="pt-8"
      >
        <OrganizationContactForm tenant={tenant} onUpdated={onTenantUpdated} />
      </OrganizationTabSection>
    </div>
  );
}
