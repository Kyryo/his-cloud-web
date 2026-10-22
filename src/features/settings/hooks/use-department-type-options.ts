"use client";

import { useMemo } from "react";

import { useClinicalSpecialties } from "@/features/clinical-workspace/hooks/use-clinical-departments";
import { ORGANIZATION_DEPARTMENT_TYPES } from "@/features/settings/constants/department-types";

export type DepartmentTypeOption = {
  value: string;
  label: string;
  /** Departments of this type run a clinical workspace and queue. */
  isClinical: boolean;
  specialtyCode: string | null;
};

const FALLBACK_OPTIONS: DepartmentTypeOption[] = ORGANIZATION_DEPARTMENT_TYPES.map(
  (type) => ({
    value: type.value,
    label: type.label,
    isClinical: type.value === "opd" || type.value === "dental",
    specialtyCode:
      type.value === "opd" || type.value === "dental" ? type.value : null,
  }),
);

/**
 * Department types from the API specialty registry, so new clinical
 * specialties appear without a web release. Falls back to the built-in list
 * while the catalog loads or when it cannot be fetched.
 */
export function useDepartmentTypeOptions(): DepartmentTypeOption[] {
  const { data } = useClinicalSpecialties();
  return useMemo(() => {
    const types = data?.department_types;
    if (!types || types.length === 0) {
      return FALLBACK_OPTIONS;
    }
    return types.map((type) => ({
      value: type.value,
      label: type.label,
      isClinical: type.is_clinical,
      specialtyCode: type.specialty_code,
    }));
  }, [data]);
}
