"use client";

import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import { useLabTestDetailWorkspace } from "@/features/laboratory/components/test-detail/lab-test-detail-workspace-context";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

export function LabTestSummaryTabPanel() {
  const { test } = useLabTestDetailWorkspace();
  const isActive = test.is_active !== false;

  return (
    <div data-testid="lab-test-summary-tab">
      <dl
        className="-mx-4 -mt-4 grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:-mx-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        aria-label="Laboratory test overview"
      >
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Status</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {isActive ? "Active" : "Inactive"}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Catalog availability</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Analytes</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.analytes?.length ?? 0}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Mapped results</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Turnaround</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.turnaround_hours != null
              ? `${test.turnaround_hours}h`
              : "—"}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Target hours</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Specimen</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.primary_specimen_type_code?.trim() || "—"}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Primary type</p>
        </div>
      </dl>

      <section className="mt-6 space-y-3 px-1">
        <h3 className="text-sm font-semibold text-brand-navy">Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Name</dt>
            <dd className="text-right font-medium text-brand-navy">
              {test.name}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Code</dt>
            <dd className="text-right font-mono font-medium text-brand-navy">
              {test.code}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Category</dt>
            <dd className="text-right font-medium text-brand-navy">
              {test.category?.trim() || "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Linked product</dt>
            <dd className="text-right font-medium text-brand-navy">
              {test.product?.name?.trim() || "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Created</dt>
            <dd className="text-right font-medium text-brand-navy">
              {formatLabDisplayDateTime(test.created_at)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Updated</dt>
            <dd className="text-right font-medium text-brand-navy">
              {formatLabDisplayDateTime(test.updated_at)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
