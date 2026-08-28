export type ActiveVisitListFilterState = {
  clinicUuid: string;
};

export const DEFAULT_ACTIVE_VISIT_FILTERS: ActiveVisitListFilterState = {
  clinicUuid: "",
};

export function countActiveVisitFilters(
  filters: ActiveVisitListFilterState,
): number {
  return filters.clinicUuid ? 1 : 0;
}
