import type { PlatformAdminCohortRetention } from "@/features/platform-admin/types/platform-admin.types";

export type CohortHeatmapCell = {
  /** [offsetIndex, cohortIndex, retentionPercent, activeCount] */
  value: [number, number, number, number];
};

export type CohortRetentionMatrix = {
  cohortLabels: string[];
  cohortSizes: number[];
  offsetLabels: string[];
  cells: CohortHeatmapCell[];
  /** Per-cohort retention percent by offset (null where not yet observed). */
  curves: { label: string; points: (number | null)[] }[];
  /** Tenant-weighted average retention percent by offset. */
  average: (number | null)[];
};

export function formatCohortMonth(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return month;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function toPercent(active: number, size: number): number {
  if (size <= 0) {
    return 0;
  }
  return Math.round((active / size) * 1000) / 10;
}

export function buildCohortRetentionMatrix(
  retention: PlatformAdminCohortRetention,
): CohortRetentionMatrix {
  const cohorts = [...retention.cohorts].sort((a, b) =>
    a.cohort_month.localeCompare(b.cohort_month),
  );
  const maxOffset = cohorts.reduce(
    (max, cohort) =>
      cohort.months.reduce((m, point) => Math.max(m, point.offset + 1), max),
    0,
  );

  const offsetLabels = Array.from({ length: maxOffset }, (_, i) => `M${i}`);
  const cells: CohortHeatmapCell[] = [];
  const activeSums = new Array<number>(maxOffset).fill(0);
  const sizeSums = new Array<number>(maxOffset).fill(0);

  const curves = cohorts.map((cohort, cohortIndex) => {
    const points = new Array<number | null>(maxOffset).fill(null);
    for (const point of cohort.months) {
      const percent = toPercent(point.active_count, cohort.tenant_count);
      points[point.offset] = percent;
      cells.push({
        value: [point.offset, cohortIndex, percent, point.active_count],
      });
      activeSums[point.offset] += point.active_count;
      sizeSums[point.offset] += cohort.tenant_count;
    }
    return { label: formatCohortMonth(cohort.cohort_month), points };
  });

  return {
    cohortLabels: curves.map((curve) => curve.label),
    cohortSizes: cohorts.map((cohort) => cohort.tenant_count),
    offsetLabels,
    cells,
    curves,
    average: activeSums.map((active, i) =>
      sizeSums[i] > 0 ? toPercent(active, sizeSums[i]) : null,
    ),
  };
}
