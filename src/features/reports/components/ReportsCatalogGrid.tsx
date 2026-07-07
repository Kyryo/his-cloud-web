"use client";

import { ChevronRight } from "lucide-react";

import { getReportCatalogSections } from "@/features/reports/constants/report-catalog";
import { useReportExport } from "@/features/reports/providers/report-export-provider";
import { cn } from "@/lib/utils";

export function ReportsCatalogGrid() {
  const { openReport } = useReportExport();
  const sections = getReportCatalogSections();

  return (
    <div className="w-full max-w-[75%] space-y-8">
      {sections.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`report-section-${section.id}`}
        >
          <div className="mb-3">
            <h2
              id={`report-section-${section.id}`}
              className="text-sm font-semibold text-brand-navy"
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-0.5 text-xs text-brand-muted">{section.description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            {section.items.map((report) => {
              const Icon = report.icon;

              return (
                <button
                  key={report.id}
                  type="button"
                  className="group block w-full text-left"
                  data-testid={`report-catalog-${report.id}`}
                  onClick={() => openReport(report.id)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 transition-colors",
                      "hover:border-brand-primary/40 hover:bg-brand-tint/30",
                    )}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-brand-navy">
                        {report.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                        {report.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
