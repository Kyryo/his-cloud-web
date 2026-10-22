"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  useRoleCapabilities,
  useUpdateRoleCapabilities,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  ClinicalRoleCapabilitiesMatrix,
  DENTAL_CAPABILITY_ROLES,
  type ClinicalCapabilityRoleKey,
} from "@/features/settings/components/ClinicalRoleCapabilitiesMatrix";
import { DentalStaffRolesSection } from "@/features/settings/components/DentalStaffRolesSection";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  SettingsSection,
  SettingsUnderlineTabs,
} from "@/features/settings/components/SettingsPageLayout";
import { DENTAL_ROLE_CAPABILITIES } from "@/features/settings/constants/clinical-role-capability-config";

export type DentalModuleTabId = "dentists" | "capabilities";

const TABS: Array<{ id: DentalModuleTabId; label: string }> = [
  { id: "dentists", label: "Dentists" },
  { id: "capabilities", label: "Role capabilities" },
];

function parseTab(value: string | null): DentalModuleTabId {
  return value === "capabilities" ? "capabilities" : "dentists";
}

export function DentalModuleSettingsTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseTab(searchParams.get("tab")),
    [searchParams],
  );

  function setActiveTab(tab: DentalModuleTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "dentists") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div data-testid="dental-module-settings">
      <SettingsUnderlineTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Dental module settings"
      />

      <div className="pt-6">
        {activeTab === "dentists" ? <DentalStaffRolesSection /> : null}
        {activeTab === "capabilities" ? <DentalRoleCapabilitiesTab /> : null}
      </div>
    </div>
  );
}

function DentalRoleCapabilitiesTab() {
  const { data = [], isLoading } = useRoleCapabilities();
  const updateCapabilities = useUpdateRoleCapabilities();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  if (isLoading) {
    return <SettingsContentSkeleton variant="matrix" />;
  }

  async function toggleCapability(
    role: ClinicalCapabilityRoleKey,
    capability: string,
    enabled: boolean,
  ) {
    const key = `${role}:${capability}`;
    setUpdatingKey(key);
    try {
      await updateCapabilities.mutateAsync([
        { user_role: role, capability, enabled },
      ]);
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <SettingsSection
      title="Role capabilities"
      description="Choose what dentists can open and record in dental encounters."
      flush
    >
      <ClinicalRoleCapabilitiesMatrix
        capabilities={DENTAL_ROLE_CAPABILITIES}
        roles={DENTAL_CAPABILITY_ROLES}
        entries={data}
        updatingKey={updatingKey}
        onToggle={(role, capability, enabled) =>
          void toggleCapability(role, capability, enabled)
        }
      />
    </SettingsSection>
  );
}
