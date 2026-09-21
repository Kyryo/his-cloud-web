import type { LabOrderedTestsViewMode } from "@/features/laboratory/components/detail/LabOrderedTestsViewToggle";

export const LAB_ORDERED_TESTS_VIEW_STORAGE_KEY =
  "hmis.lab-order.ordered-tests-view";

export const DEFAULT_LAB_ORDERED_TESTS_VIEW: LabOrderedTestsViewMode = "cards";

export function parseLabOrderedTestsViewMode(
  value: string | null | undefined,
): LabOrderedTestsViewMode {
  return value === "list" ? "list" : DEFAULT_LAB_ORDERED_TESTS_VIEW;
}

export function readLabOrderedTestsViewMode(): LabOrderedTestsViewMode {
  if (typeof window === "undefined") {
    return DEFAULT_LAB_ORDERED_TESTS_VIEW;
  }

  try {
    return parseLabOrderedTestsViewMode(
      window.localStorage.getItem(LAB_ORDERED_TESTS_VIEW_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_LAB_ORDERED_TESTS_VIEW;
  }
}

export function writeLabOrderedTestsViewMode(
  mode: LabOrderedTestsViewMode,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LAB_ORDERED_TESTS_VIEW_STORAGE_KEY, mode);
  } catch {
    // Ignore quota / private-mode failures.
  }
}
