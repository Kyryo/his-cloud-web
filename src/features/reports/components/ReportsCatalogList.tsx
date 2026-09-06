"use client";

import { AppIcon } from "@/components/icons/app-icon";
import {
  getReportCatalogSections,
  type ReportCatalogItem,
} from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import { describeReportFilterChips } from "@/features/reports/utils/report-export-summary";

const MAX_VISIBLE_CHIPS = 3;

function ReportCatalogTile({
  report,
  onOpen,
}: {
  report: ReportCatalogItem;
  onOpen: (reportId: string) => void;
}) {
  const chips = describeReportFilterChips(report);
  const visibleChips = chips.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenChipCount = chips.length - visibleChips.length;

  return (
    <button
      type="button"
      className="group flex w-full items-start gap-3 rounded-xl border border-dash-border/80 bg-white px-4 py-3.5 text-left transition-colors hover:border-brand-primary/35 hover:bg-brand-tint/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
      data-testid={`report-catalog-${report.id}`}
      onClick={() => onOpen(report.id)}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
        <AppIcon name={report.icon} size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
          {report.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-brand-muted">
          {report.description}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {visibleChips.map((chip) => (
            <span
              key={chip}
              className="rounded-md bg-dash-canvas px-1.5 py-0.5 text-[11px] text-brand-slate"
            >
              {chip}
            </span>
          ))}
          {hiddenChipCount > 0 ? (
            <span className="px-0.5 py-0.5 text-[11px] text-brand-muted">
              +{hiddenChipCount}
            </span>
          ) : null}
        </div>
      </div>

      <AppIcon
        name="chevronRight"
        size={16}
        className="mt-1.5 shrink-0 text-brand-muted/50 group-hover:text-brand-primary"
      />
    </button>
  );
}

export function ReportsCatalogList() {
  const { openReport } = useReportExport();
  const sections = getReportCatalogSections();

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`report-section-${section.id}`}
          className="space-y-3"
        >
          <div>
            <h2
              id={`report-section-${section.id}`}
              className="text-sm font-semibold tracking-tight text-brand-navy"
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-0.5 text-sm text-brand-muted">
                {section.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {section.items.map((report) => (
              <ReportCatalogTile
                key={report.id}
                report={report}
                onOpen={openReport}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
