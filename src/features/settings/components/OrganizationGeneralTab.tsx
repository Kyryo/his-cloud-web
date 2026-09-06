import { OrganizationContactForm } from "@/features/settings/components/OrganizationContactForm";
import { OrganizationCurrencySection } from "@/features/settings/components/OrganizationCurrencySection";
import { OrganizationFieldRow } from "@/features/settings/components/OrganizationTabContent";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
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

export function OrganizationGeneralTab({
  tenant,
  onTenantUpdated,
}: OrganizationGeneralTabProps) {
  const identityMeta = [
    tenant.code,
    tenant.is_active ? "Active" : "Inactive",
    tenant.country,
  ]
    .filter((value) => Boolean(value))
    .join(" · ");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-base font-semibold text-brand-navy">{tenant.name}</p>
        {identityMeta ? (
          <p className="mt-1 text-sm text-slate-400">{identityMeta}</p>
        ) : null}
      </div>

      <SettingsSection
        title="Details"
        description="Identifiers and billing defaults for this organization."
        flush
      >
        <div>
          <OrganizationFieldRow label="Code">
            {formatValue(tenant.code)}
          </OrganizationFieldRow>
          <OrganizationFieldRow label="Country">
            {formatValue(tenant.country)}
          </OrganizationFieldRow>
          <OrganizationFieldRow label="Currency">
            <OrganizationCurrencySection />
          </OrganizationFieldRow>
          <OrganizationFieldRow label="Description">
            {formatValue(tenant.description)}
          </OrganizationFieldRow>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Contact"
        description="Shown on invoices, receipts, and other official documents."
      >
        <OrganizationContactForm
          key={`${tenant.uuid}-${tenant.updated_at}`}
          tenant={tenant}
          onUpdated={onTenantUpdated}
        />
      </SettingsSection>
    </div>
  );
}
