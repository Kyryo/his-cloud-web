export const ORGANIZATION_DEPARTMENT_TYPES = [
  { value: "opd", label: "OPD" },
  { value: "dental", label: "Dental" },
  { value: "physio", label: "Physiotherapy" },
  { value: "speech", label: "Speech Therapy" },
  { value: "occupational", label: "Occupational Therapy" },
  { value: "radiology", label: "Radiology" },
  { value: "lab", label: "Laboratory" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "other", label: "Other" },
] as const;

export function getDepartmentTypeLabel(value: string) {
  return (
    ORGANIZATION_DEPARTMENT_TYPES.find((type) => type.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}
