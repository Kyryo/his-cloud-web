"use client";

import {
  getReportCategoryTitle,
  type ReportCatalogItem,
} from "@/features/reports/constants/report-catalog";
import type { ReportExportPhase } from "@/features/reports/providers/report-export-provider";
import {
  describeReportPeriod,
  listActiveReportFilters,
} from "@/features/reports/utils/report-export-summary";

type ReportExportSummaryRailProps = {
  item: ReportCatalogItem;
  values: Record<string, string>;
  phase: ReportExportPhase;
};

export function ReportExportSummaryRail({
  item,
  values,
  phase,
}: ReportExportSummaryRailProps) {
  const period = describeReportPeriod(item, values);
  const activeFilters = listActiveReportFilters(item, values);
  const isLocked = phase !== "filters";

  return (
    <aside
      className="border-b border-dash-border/70 bg-dash-canvas/60 px-5 py-5 sm:border-b-0 sm:border-r"
      aria-label="Export summary"
      data-testid="report-export-summary"
    >
      <p className="text-xs font-medium text-brand-muted">
        {getReportCategoryTitle(item.category)}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-brand-navy">
        {item.description}
      </p>

      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
            Period
          </dt>
          <dd
            className="mt-1 text-sm font-medium text-brand-navy"
            data-testid="report-export-summary-period"
          >
            {period}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
            Filters
          </dt>
          <dd className="mt-1.5">
            {activeFilters.length === 0 ? (
              <span className="text-sm text-brand-muted">
                {isLocked ? "None applied" : "Everything included"}
              </span>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {activeFilters.map((filter) => (
                  <li
                    key={filter.name}
                    className="rounded-md border border-dash-border bg-white px-2 py-0.5 text-xs text-brand-navy"
                  >
                    <span className="text-brand-muted">{filter.label}: </span>
                    {filter.value}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
            Format
          </dt>
          <dd className="mt-1 text-sm font-medium text-brand-navy">
            CSV spreadsheet
          </dd>
        </div>
      </dl>
    </aside>
  );
}
