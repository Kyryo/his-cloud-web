/**
 * Departments offered at signup. Types match Department.DepartmentType in the API,
 * excluding "other", which is not a workspace. Modules are the portal groups
 * those departments need. Registration and billing stay on for every clinic.
 */
export type SignupDepartmentOption = {
  id: string;
  label: string;
  description: string;
  modules: readonly string[];
};

export const SIGNUP_BASELINE_MODULES = ["Registration", "Billing"] as const;

/** An outpatient clinic is assumed to draw labs and dispense medicine. */
export const OPD_INCLUDED_DEPARTMENTS = ["lab", "pharmacy"] as const;

/** Specialty departments kept behind "See more" on the signup picker. */
export const MORE_SIGNUP_DEPARTMENTS = [
  "occupational_health",
  "physio",
  "occupational",
  "speech",
  "lab",
  "pharmacy",
] as const;

const MORE_SIGNUP_DEPARTMENT_IDS = new Set<string>(MORE_SIGNUP_DEPARTMENTS);

export function primarySignupDepartments(): SignupDepartmentOption[] {
  return SIGNUP_DEPARTMENTS.filter(
    (department) => !MORE_SIGNUP_DEPARTMENT_IDS.has(department.id),
  );
}

export function moreSignupDepartments(): SignupDepartmentOption[] {
  const byId = new Map(
    SIGNUP_DEPARTMENTS.map((department) => [department.id, department]),
  );
  return MORE_SIGNUP_DEPARTMENTS.flatMap((id) => {
    const department = byId.get(id);
    return department ? [department] : [];
  });
}

export function toggleSignupDepartment(
  current: readonly string[],
  departmentId: string,
): string[] {
  const selected = new Set(current);
  if (selected.has(departmentId)) {
    selected.delete(departmentId);
    if (departmentId === "opd") {
      for (const included of OPD_INCLUDED_DEPARTMENTS) {
        selected.delete(included);
      }
    }
  } else {
    selected.add(departmentId);
  }
  return orderSignupDepartments(expandSignupDepartments([...selected]));
}

function orderSignupDepartments(departmentIds: readonly string[]): string[] {
  const selected = new Set(departmentIds);
  return SIGNUP_DEPARTMENTS.map((department) => department.id).filter((id) =>
    selected.has(id),
  );
}

export function expandSignupDepartments(departmentIds: readonly string[]): string[] {
  const ordered = [...new Set(departmentIds)];
  if (!ordered.includes("opd")) {
    return ordered;
  }
  for (const departmentId of OPD_INCLUDED_DEPARTMENTS) {
    if (!ordered.includes(departmentId)) {
      ordered.push(departmentId);
    }
  }
  return ordered;
}

export const SIGNUP_DEPARTMENTS: readonly SignupDepartmentOption[] = [
  {
    id: "opd",
    label: "OPD",
    description: "Outpatient consultations and general clinic visits.",
    modules: ["Clinical"],
  },
  {
    id: "dental",
    label: "Dental",
    description: "Dental charting and procedure visits.",
    modules: ["Dental"],
  },
  {
    id: "occupational_health",
    label: "Occupational Health",
    description: "Employment surveillance, fitness, and compliance.",
    modules: ["OccupationalHealth"],
  },
  {
    id: "physio",
    label: "Physiotherapy",
    description: "Physiotherapy assessments and treatment visits.",
    modules: ["Therapy"],
  },
  {
    id: "occupational",
    label: "Occupational Therapy",
    description: "Occupational therapy assessments and treatment visits.",
    modules: ["Therapy"],
  },
  {
    id: "speech",
    label: "Speech Therapy",
    description: "Speech and language therapy visits.",
    modules: ["Therapy"],
  },
  {
    id: "lab",
    label: "Laboratory",
    description: "Lab orders, specimens, and results.",
    modules: ["Lab"],
  },
  {
    id: "radiology",
    label: "Radiology",
    description: "Imaging orders and results.",
    modules: ["Radiology"],
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    description: "Dispensing and medication stock.",
    modules: ["Dispensation", "Inventory"],
  },
] as const;

export function signupDepartmentModuleNames(departmentIds: readonly string[]): string[] {
  const selected = new Set(expandSignupDepartments(departmentIds));
  const modules = [...SIGNUP_BASELINE_MODULES];
  const seen = new Set<string>(modules);

  for (const department of SIGNUP_DEPARTMENTS) {
    if (!selected.has(department.id)) {
      continue;
    }
    for (const moduleName of department.modules) {
      if (seen.has(moduleName)) {
        continue;
      }
      seen.add(moduleName);
      modules.push(moduleName);
    }
  }

  return modules;
}
