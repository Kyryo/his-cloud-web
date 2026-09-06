"use client";

import Link from "next/link";
import { useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import {
  useRoleCapabilities,
  useUpdateRoleCapabilities,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  ClinicalRoleCapabilitiesMatrix,
  type ClinicalCapabilityRoleKey,
} from "@/features/settings/components/ClinicalRoleCapabilitiesMatrix";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import {
  CLINICAL_ROLE_ACTION_CAPABILITIES,
  CLINICAL_WORKSPACE_TAB_CAPABILITIES,
} from "@/features/settings/constants/clinical-role-capability-config";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function ClinicalRoleCapabilitiesSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const { data = [], isLoading } = useRoleCapabilities();
  const updateCapabilities = useUpdateRoleCapabilities();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isUserLoading || isLoading) {
    return <SettingsContentSkeleton variant="matrix" />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Clinical role capabilities"
        description="Configure which clinical actions each role may perform."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Tenant administrator permissions are required to manage clinical role
              capabilities.
            </p>
            <Button asChild variant="outline">
              <Link href={ROUTES.settingsAccount}>Back to account settings</Link>
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    );
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
    <SettingsPageLayout
      title="Clinical role capabilities"
      description="Configure which OPD workspace tabs and clinical actions nurses and physicians may access."
      className="max-w-3xl"
    >
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
    </SettingsPageLayout>
  );
}
