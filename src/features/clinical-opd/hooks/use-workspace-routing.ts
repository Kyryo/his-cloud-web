"use client";

import { OPD_WORKSPACE_ROUTING } from "@/features/clinical-opd/constants/opd-workspace-routing";
import { useOptionalClinicalWorkspaceConfig } from "@/features/clinical-workspace/components/clinical-workspace-config-context";
import type { ClinicalWorkspaceRouting } from "@/features/clinical-workspace/types/clinical-workspace.types";

/**
 * Routing of the surrounding specialty workspace. Shared clinical sections
 * fall back to OPD when rendered outside a specialty workspace.
 */
export function useWorkspaceRouting(): ClinicalWorkspaceRouting {
  return useOptionalClinicalWorkspaceConfig() ?? OPD_WORKSPACE_ROUTING;
}
