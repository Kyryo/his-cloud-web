import type {
  OrganizationUser,
  OrganizationUserRole,
} from "@/features/settings/types/settings.types";

export type ClinicalStaffGroupId = "physician" | "nurse" | "unassigned";

export type ClinicalStaffGroup = {
  id: ClinicalStaffGroupId;
  title: string;
  users: OrganizationUser[];
};

const GROUP_ORDER: ClinicalStaffGroupId[] = [
  "physician",
  "nurse",
  "unassigned",
];

const GROUP_TITLES: Record<ClinicalStaffGroupId, string> = {
  physician: "Physicians",
  nurse: "Nurses",
  unassigned: "Unassigned",
};

export function isClinicalStaffUser(user: OrganizationUser): boolean {
  return (
    user.groups.includes("Clinical") ||
    user.user_role === "nurse" ||
    user.user_role === "physician"
  );
}

export function resolveClinicalStaffGroup(
  user: OrganizationUser,
): ClinicalStaffGroupId {
  if (user.user_role === "physician") {
    return "physician";
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

export function groupClinicalStaff(
  users: OrganizationUser[],
): ClinicalStaffGroup[] {
  const grouped: Record<ClinicalStaffGroupId, OrganizationUser[]> = {
    physician: [],
    nurse: [],
    unassigned: [],
  };

  for (const user of users) {
    grouped[resolveClinicalStaffGroup(user)].push(user);
  }

  return GROUP_ORDER.map((id) => ({
    id,
    title: GROUP_TITLES[id],
    users: grouped[id],
  })).filter((group) => group.users.length > 0);
}

export function isAssignableClinicalRole(
  value: string,
): value is Extract<OrganizationUserRole, "" | "nurse" | "physician"> {
  return value === "" || value === "nurse" || value === "physician";
}
