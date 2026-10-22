import { DENTAL_WORKSPACE_ROUTING } from "@/features/clinical-dental/constants/dental-workspace-routing";
import { OPD_WORKSPACE_ROUTING } from "@/features/clinical-opd/constants/opd-workspace-routing";
import type { ClinicalWorkspaceRouting } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { workspaceLandingHref } from "@/features/clinical-workspace/utils/workspace-tabs";

const WORKSPACE_ROUTINGS: readonly ClinicalWorkspaceRouting[] = [
  OPD_WORKSPACE_ROUTING,
  DENTAL_WORKSPACE_ROUTING,
];

/**
 * Landing URL of the specialty workspace that owns `departmentType`, or null
 * when the department has no clinical workspace.
 */
export function clinicalEncounterLandingHref(
  departmentType: string | null | undefined,
  visitUuid: string,
  encounterUuid: string,
  capabilities: readonly string[],
  userRole?: string | null,
): string | null {
  const routing = WORKSPACE_ROUTINGS.find((item) =>
    item.specialty.departmentTypes.includes(departmentType ?? ""),
  );
  if (!routing) {
    return null;
  }
  return workspaceLandingHref(
    routing,
    visitUuid,
    encounterUuid,
    capabilities,
    userRole,
  );
}
