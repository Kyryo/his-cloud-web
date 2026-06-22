export type OnboardingModuleOption = {
  id: string;
  name: string;
  label: string;
  description: string;
};

/** Portal module groups available during signup (matches backend PORTAL_GROUPS). */
export const ONBOARDING_MODULE_OPTIONS: OnboardingModuleOption[] = [
  {
    id: "registration",
    name: "Registration",
    label: "Front desk",
    description: "Patient registration, queue, and visit intake.",
  },
  {
    id: "billing",
    name: "Billing",
    label: "Billing",
    description: "Invoices, payments, and insurance claims.",
  },
  {
    id: "inventory",
    name: "Inventory",
    label: "Inventory",
    description: "Stock, purchasing, and internal transfers.",
  },
  {
    id: "dispensation",
    name: "Dispensation",
    label: "Pharmacy",
    description: "Dispensing workflows and medication management.",
  },
  {
    id: "lab",
    name: "Lab",
    label: "Laboratory",
    description: "Lab orders, results, and reporting.",
  },
  {
    id: "radiology",
    name: "Radiology",
    label: "Radiology",
    description: "Imaging orders and result tracking.",
  },
  {
    id: "dental",
    name: "Dental",
    label: "Dental",
    description: "Dental charting and procedure workflows.",
  },
  {
    id: "clinical",
    name: "Clinical",
    label: "Clinical",
    description: "Consultations, notes, and care plans.",
  },
] as const;

export const REGISTRATION_MODULE_NAME = "Registration";

export function moduleIdsToGroupNames(moduleIds: string[]): string[] {
  const lookup = new Map(
    ONBOARDING_MODULE_OPTIONS.map((option) => [option.id, option.name]),
  );

  return moduleIds
    .map((moduleId) => lookup.get(moduleId))
    .filter((name): name is string => Boolean(name));
}

export function groupNamesToModuleIds(groupNames: string[]): string[] {
  const lookup = new Map(
    ONBOARDING_MODULE_OPTIONS.map((option) => [
      option.name.toLowerCase(),
      option.id,
    ]),
  );

  return groupNames
    .map((name) => lookup.get(name.toLowerCase()))
    .filter((id): id is string => Boolean(id));
}
