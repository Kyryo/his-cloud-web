export const OVERVIEW_USAGE_MIN_AREAS = 2;

export type WorkspaceUsageRow = {
  area_key: string;
  use_count: number;
  last_used_at: string;
};

export function rankOverviewUsage(
  rows: WorkspaceUsageRow[],
  allowedHrefs: Set<string>,
) {
  return rows
    .filter((row) => allowedHrefs.has(row.area_key))
    .sort((left, right) => {
      if (right.use_count !== left.use_count) {
        return right.use_count - left.use_count;
      }
      return right.last_used_at.localeCompare(left.last_used_at);
    });
}

export function shouldShowOverviewUsage(areaCount: number) {
  return areaCount >= OVERVIEW_USAGE_MIN_AREAS;
}
