"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ClinicalMemberDepartment } from "@/features/clinical-workspace/types/clinical-workspace.types";

export const DEPARTMENT_SEARCH_PARAM = "department";

/**
 * Department chosen through `?department=`. Unknown or foreign UUIDs resolve
 * to null so the queue falls back to every member department.
 */
export function useSelectedDepartment(
  departments: readonly ClinicalMemberDepartment[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get(DEPARTMENT_SEARCH_PARAM);
  const selected =
    departments.find((department) => department.uuid === requested) ?? null;

  const select = useCallback(
    (departmentUuid: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (departmentUuid) {
        params.set(DEPARTMENT_SEARCH_PARAM, departmentUuid);
      } else {
        params.delete(DEPARTMENT_SEARCH_PARAM);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return { selectedDepartment: selected, selectDepartment: select };
}
