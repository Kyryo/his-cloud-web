import type { AppIconName } from "@/components/icons/app-icon";

/**
 * Clinical specialties served by the shared EMR workspace.
 * Keep in sync with api/eportal/clinical/specialties/builtin.py.
 */
export type ClinicalSpecialtyCode = "opd" | "dental";

/** Visit order item types the Orders tab can place. */
export type ClinicalOrdersTabItemType =
  | "LABORATORY"
  | "RADIOLOGY"
  | "PROCEDURE"
  | "SUNDRY";

export type ClinicalSpecialtyDefinition = {
  code: ClinicalSpecialtyCode;
  label: string;
  /** Route prefix of the queue and encounter workspace. */
  basePath: `/clinical/${ClinicalSpecialtyCode}`;
  /** Portal Auth group that grants access to the specialty. */
  accessGroup: string;
  /** Tenant module entitlement that must be active. */
  moduleName: string;
  departmentTypes: readonly string[];
  queueNavLabel: string;
  /** Shown when the queue has no encounters. */
  queueEmptyDescription: string;
  /** Catalog `procedure_context` of procedures ordered in this workspace. */
  procedureContext: "opd" | "dental";
  /** Orders tab item types; omitted means every type. */
  orderItemTypes?: readonly ClinicalOrdersTabItemType[];
  icon: AppIconName;
};

/** Whether the specialty's Orders tab may place `itemType` orders. */
export function specialtyAllowsOrderItemType(
  specialty: Pick<ClinicalSpecialtyDefinition, "orderItemTypes">,
  itemType: string,
): boolean {
  return (
    !specialty.orderItemTypes ||
    specialty.orderItemTypes.some((allowed) => allowed === itemType)
  );
}

export const CLINICAL_SPECIALTIES: readonly ClinicalSpecialtyDefinition[] = [
  {
    code: "opd",
    label: "OPD",
    basePath: "/clinical/opd",
    accessGroup: "Clinical",
    moduleName: "Clinical",
    departmentTypes: ["opd"],
    queueNavLabel: "OPD Queue",
    queueEmptyDescription:
      "Active outpatient visits will appear here once clients are checked in and assigned to an OPD department.",
    procedureContext: "opd",
    icon: "hospital",
  },
  {
    code: "dental",
    label: "Dental",
    basePath: "/clinical/dental",
    accessGroup: "Dental",
    moduleName: "Dental",
    departmentTypes: ["dental"],
    queueNavLabel: "Dental Queue",
    queueEmptyDescription:
      "Active visits will appear here once clients are checked in and assigned to a dental department you belong to.",
    procedureContext: "dental",
    orderItemTypes: ["RADIOLOGY", "SUNDRY"],
    icon: "dental",
  },
];

export function getClinicalSpecialty(
  code: ClinicalSpecialtyCode,
): ClinicalSpecialtyDefinition {
  const specialty = CLINICAL_SPECIALTIES.find((item) => item.code === code);
  if (!specialty) {
    throw new Error(`Unknown clinical specialty: ${code}`);
  }
  return specialty;
}

/** The specialty whose workspace owns `pathname`, if any. */
export function clinicalSpecialtyForPath(
  pathname: string,
): ClinicalSpecialtyDefinition | null {
  return (
    CLINICAL_SPECIALTIES.find(
      (specialty) =>
        pathname === specialty.basePath ||
        pathname.startsWith(`${specialty.basePath}/`),
    ) ?? null
  );
}

/** The specialty that owns a department type, if it is clinical. */
export function clinicalSpecialtyForDepartmentType(
  departmentType: string | null | undefined,
): ClinicalSpecialtyDefinition | null {
  if (!departmentType) {
    return null;
  }
  return (
    CLINICAL_SPECIALTIES.find((specialty) =>
      specialty.departmentTypes.includes(departmentType),
    ) ?? null
  );
}
