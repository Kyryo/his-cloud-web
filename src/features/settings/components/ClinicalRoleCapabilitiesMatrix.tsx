"use client";

import { Switch } from "@/components/ui/switch";
import type { ClinicalRoleCapability } from "@/features/clinical-opd/types/clinical-opd.types";
import type { ClinicalRoleCapabilityMeta } from "@/features/settings/constants/clinical-role-capability-config";
import { cn } from "@/lib/utils";

export const CLINICAL_CAPABILITY_ROLES = [
  { key: "nurse", title: "Nurses" },
  { key: "physician", title: "Physicians" },
] as const;

export type ClinicalCapabilityRoleKey =
  (typeof CLINICAL_CAPABILITY_ROLES)[number]["key"];

type ClinicalRoleCapabilitiesMatrixProps = {
  capabilities: ClinicalRoleCapabilityMeta[];
  entries: ClinicalRoleCapability[];
  updatingKey: string | null;
  onToggle: (
    role: ClinicalCapabilityRoleKey,
    capability: string,
    enabled: boolean,
  ) => void;
};

function isCapabilityEnabled(
  entries: ClinicalRoleCapability[],
  role: string,
  capability: string,
) {
  return entries.some(
    (entry) => entry.user_role === role && entry.capability === capability,
  );
}

export function ClinicalRoleCapabilitiesMatrix({
  capabilities,
  entries,
  updatingKey,
  onToggle,
}: ClinicalRoleCapabilitiesMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] table-fixed">
        <thead>
          <tr className="border-b border-brand-border">
            <th scope="col" className="pb-3 text-left">
              <span className="sr-only">Capability</span>
            </th>
            {CLINICAL_CAPABILITY_ROLES.map((role) => (
              <th
                key={role.key}
                scope="col"
                className="w-24 pb-3 text-center text-xs font-medium text-slate-400 sm:w-28"
              >
                {role.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((capability) => (
            <tr
              key={capability.key}
              className="border-b border-brand-border last:border-b-0"
            >
              <th scope="row" className="py-3.5 pr-4 text-left font-normal">
                <p className="text-sm font-medium text-brand-navy">
                  {capability.label}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {capability.description}
                </p>
              </th>
              {CLINICAL_CAPABILITY_ROLES.map((role) => {
                const controlId = `${role.key}-${capability.key}`;
                const checked = isCapabilityEnabled(
                  entries,
                  role.key,
                  capability.key,
                );
                const disabled = updatingKey === `${role.key}:${capability.key}`;

                return (
                  <td key={role.key} className="py-3.5 text-center">
                    <div
                      className={cn(
                        "flex justify-center",
                        disabled && "opacity-60",
                      )}
                    >
                      <Switch
                        id={controlId}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(enabled) =>
                          onToggle(role.key, capability.key, enabled)
                        }
                        aria-label={`${role.title}: ${capability.label}`}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
