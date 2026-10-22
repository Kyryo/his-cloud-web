"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClinicalMemberDepartment } from "@/features/clinical-workspace/types/clinical-workspace.types";

export const ALL_DEPARTMENTS_VALUE = "all";

type ClinicalDepartmentSwitcherProps = {
  departments: ClinicalMemberDepartment[];
  /** Selected department UUID, or null for every department. */
  value: string | null;
  onChange: (departmentUuid: string | null) => void;
  specialtyLabel: string;
};

function departmentLabel(
  department: ClinicalMemberDepartment,
  showClinic: boolean,
): string {
  return showClinic
    ? `${department.name} · ${department.clinic_name}`
    : department.name;
}

/** Pick which of the user's departments the queue shows. */
export function ClinicalDepartmentSwitcher({
  departments,
  value,
  onChange,
  specialtyLabel,
}: ClinicalDepartmentSwitcherProps) {
  if (departments.length < 2) {
    return null;
  }
  const showClinic =
    new Set(departments.map((department) => department.clinic_uuid)).size > 1;

  return (
    <Select
      value={value ?? ALL_DEPARTMENTS_VALUE}
      onValueChange={(next) =>
        onChange(next === ALL_DEPARTMENTS_VALUE ? null : next)
      }
    >
      <SelectTrigger
        className="h-9 w-full text-sm sm:w-[260px]"
        aria-label={`${specialtyLabel} department`}
        data-testid="clinical-department-switcher"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_DEPARTMENTS_VALUE}>
          All {specialtyLabel} departments
        </SelectItem>
        {departments.map((department) => (
          <SelectItem key={department.uuid} value={department.uuid}>
            {departmentLabel(department, showClinic)} ({department.waiting_count}{" "}
            waiting)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
