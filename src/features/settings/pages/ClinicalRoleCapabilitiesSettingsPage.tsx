"use client";

import Link from "next/link";
import { useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {
  useRoleCapabilities,
  useUpdateRoleCapabilities,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { ClinicalRoleCapabilityToggleCard } from "@/features/settings/components/ClinicalRoleCapabilityToggleCard";
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

const ROLES = [
  { key: "nurse", title: "Nurses" },
  { key: "physician", title: "Physicians" },
] as const;

type CapabilityGroup = {
  title: string;
  capabilities: typeof CLINICAL_WORKSPACE_TAB_CAPABILITIES;
};

const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    title: "Workspace tabs",
    capabilities: CLINICAL_WORKSPACE_TAB_CAPABILITIES,
  },
  {
    title: "Actions",
    capabilities: CLINICAL_ROLE_ACTION_CAPABILITIES,
  },
];

export function ClinicalRoleCapabilitiesSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const { data = [], isLoading } = useRoleCapabilities();
  const updateCapabilities = useUpdateRoleCapabilities();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isUserLoading || isLoading) {
    return <PageLoader />;
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

  function isEnabled(role: string, capability: string) {
    return data.some(
      (entry) => entry.user_role === role && entry.capability === capability,
    );
  }

  async function toggleCapability(
    role: string,
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
    >
      <div className="space-y-10">
        {ROLES.map((role) => (
          <section key={role.key} className="space-y-6">
            <h2 className="text-base font-semibold text-brand-navy">
              {role.title}
            </h2>

            {CAPABILITY_GROUPS.map((group) => (
              <div key={`${role.key}-${group.title}`} className="space-y-3">
                <h3 className="text-sm font-medium text-brand-muted">
                  {group.title}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.capabilities.map((capability) => {
                    const controlId = `${role.key}-${capability.key}`;
                    const checked = isEnabled(role.key, capability.key);
                    const disabled =
                      updatingKey === `${role.key}:${capability.key}`;

                    return (
                      <ClinicalRoleCapabilityToggleCard
                        key={controlId}
                        id={controlId}
                        label={capability.label}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(enabled) =>
                          void toggleCapability(role.key, capability.key, enabled)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </SettingsPageLayout>
  );
}
