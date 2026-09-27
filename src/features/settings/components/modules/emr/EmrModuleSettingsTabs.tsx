"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ClinicalStaffRolesSection } from "@/features/settings/components/ClinicalStaffRolesSection";
import {
  ClinicalRoleCapabilitiesMatrix,
  type ClinicalCapabilityRoleKey,
} from "@/features/settings/components/ClinicalRoleCapabilitiesMatrix";
import {
  SettingsSection,
  SettingsUnderlineTabs,
} from "@/features/settings/components/SettingsPageLayout";
import {
  CLINICAL_ROLE_ACTION_CAPABILITIES,
  CLINICAL_WORKSPACE_TAB_CAPABILITIES,
} from "@/features/settings/constants/clinical-role-capability-config";
import {
  useRoleCapabilities,
  useUpdateRoleCapabilities,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";

export type EmrModuleTabId = "providers" | "capabilities";

const TABS: Array<{ id: EmrModuleTabId; label: string }> = [
  { id: "providers", label: "Providers" },
  { id: "capabilities", label: "Role capabilities" },
];

function parseTab(value: string | null): EmrModuleTabId {
  return value === "capabilities" ? "capabilities" : "providers";
}

export function EmrModuleSettingsTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseTab(searchParams.get("tab")),
    [searchParams],
  );

  function setActiveTab(tab: EmrModuleTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "providers") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div>
      <SettingsUnderlineTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="EMR module settings"
      />

      <div className="pt-6">
        {activeTab === "providers" ? <ClinicalStaffRolesSection /> : null}
        {activeTab === "capabilities" ? <RoleCapabilitiesTab /> : null}
      </div>
    </div>
  );
}

function RoleCapabilitiesTab() {
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
    <div className="space-y-8">
      <SettingsSection
        title="Workspace tabs"
        description="Choose which visit workspace tabs each role can open."
        flush
      >
        <ClinicalRoleCapabilitiesMatrix
          capabilities={CLINICAL_WORKSPACE_TAB_CAPABILITIES}
          entries={data}
          updatingKey={updatingKey}
          onToggle={(role, capability, enabled) =>
            void toggleCapability(role, capability, enabled)
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Actions"
        description="Choose what each role can record or order during a visit."
        flush
      >
        <ClinicalRoleCapabilitiesMatrix
          capabilities={CLINICAL_ROLE_ACTION_CAPABILITIES}
          entries={data}
          updatingKey={updatingKey}
          onToggle={(role, capability, enabled) =>
            void toggleCapability(role, capability, enabled)
          }
        />
      </SettingsSection>
    </div>
  );
}
