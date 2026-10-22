import { CLINICAL_SPECIALTIES } from "@/features/clinical-workspace/constants/clinical-specialties";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "@/features/settings/types/settings.types";

export type ClinicalStaffGroupId = "physician" | "dentist" | "nurse" | "unassigned";

export type ClinicalStaffGroup = {
  id: ClinicalStaffGroupId;
  title: string;
  users: OrganizationUser[];
};

const EMR_GROUP_ORDER: ClinicalStaffGroupId[] = [
  "physician",
  "nurse",
  "unassigned",
];

const DENTAL_GROUP_ORDER: ClinicalStaffGroupId[] = ["dentist", "unassigned"];

const GROUP_TITLES: Record<ClinicalStaffGroupId, string> = {
  physician: "Physicians",
  dentist: "Dentists",
  nurse: "Nurses",
  unassigned: "Unassigned",
};

const EMR_ROLES = new Set<OrganizationUserRole>(["nurse", "physician"]);
const DENTAL_ROLES = new Set<OrganizationUserRole>(["dentist"]);

const EMR_ACCESS_GROUP =
  CLINICAL_SPECIALTIES.find((specialty) => specialty.code === "opd")
    ?.accessGroup ?? "Clinical";
const DENTAL_ACCESS_GROUP =
  CLINICAL_SPECIALTIES.find((specialty) => specialty.code === "dental")
    ?.accessGroup ?? "Dental";

/** @deprecated Prefer isEmrStaffUser / isDentalStaffUser. */
export function isClinicalStaffUser(user: OrganizationUser): boolean {
  return isEmrStaffUser(user) || isDentalStaffUser(user);
}

/** Clinical / OPD providers list: nurses and physicians. */
export function isEmrStaffUser(user: OrganizationUser): boolean {
  if (user.user_role === "dentist") {
    return false;
  }
  return (
    user.groups.includes(EMR_ACCESS_GROUP) ||
    EMR_ROLES.has(user.user_role ?? "")
  );
}

/** Dental providers list: dentists and Dental-group members. */
export function isDentalStaffUser(user: OrganizationUser): boolean {
  return (
    user.groups.includes(DENTAL_ACCESS_GROUP) ||
    DENTAL_ROLES.has(user.user_role ?? "")
  );
}

export function resolveClinicalStaffGroup(
  user: OrganizationUser,
): ClinicalStaffGroupId {
  if (user.user_role === "physician") {
    return "physician";
  }
  if (user.user_role === "dentist") {
    return "dentist";
  }
  if (user.user_role === "nurse") {
    return "nurse";
  }
  return "unassigned";
}

export function filterClinicalStaff(
  users: OrganizationUser[],
  query: string,
): OrganizationUser[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return users;
  }

  return users.filter((user) => {
    const clinic = user.primary_clinic?.name.toLowerCase() ?? "";
    return (
      user.name.toLowerCase().includes(normalized) ||
      user.email.toLowerCase().includes(normalized) ||
      clinic.includes(normalized)
    );
  });
}

function groupStaffByOrder(
  users: OrganizationUser[],
  order: readonly ClinicalStaffGroupId[],
): ClinicalStaffGroup[] {
  const grouped: Record<ClinicalStaffGroupId, OrganizationUser[]> = {
    physician: [],
    dentist: [],
    nurse: [],
    unassigned: [],
  };

  for (const user of users) {
    const groupId = resolveClinicalStaffGroup(user);
    if (!order.includes(groupId)) {
      grouped.unassigned.push(user);
      continue;
    }
    grouped[groupId].push(user);
  }

  return order
    .map((id) => ({
      id,
      title: GROUP_TITLES[id],
      users: grouped[id],
    }))
    .filter((group) => group.users.length > 0);
}

/** EMR providers: physicians, nurses, unassigned. */
export function groupClinicalStaff(
  users: OrganizationUser[],
): ClinicalStaffGroup[] {
  return groupStaffByOrder(users, EMR_GROUP_ORDER);
}

/** Dental providers: dentists and unassigned Dental-group members. */
export function groupDentalStaff(
  users: OrganizationUser[],
): ClinicalStaffGroup[] {
  return groupStaffByOrder(users, DENTAL_GROUP_ORDER);
}

export function isAssignableClinicalRole(
  value: string,
): value is Extract<OrganizationUserRole, "" | "nurse" | "physician" | "dentist"> {
  return (
    value === "" ||
    value === "nurse" ||
    value === "physician" ||
    value === "dentist"
  );
}

export function isAssignableEmrRole(
  value: string,
): value is Extract<OrganizationUserRole, "" | "nurse" | "physician"> {
  return value === "" || value === "nurse" || value === "physician";
}

export function isAssignableDentalRole(
  value: string,
): value is Extract<OrganizationUserRole, "" | "dentist"> {
  return value === "" || value === "dentist";
}
