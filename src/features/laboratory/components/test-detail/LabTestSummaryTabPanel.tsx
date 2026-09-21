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
        className="-mx-4 -mt-4 grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:-mx-6 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        aria-label="Laboratory test overview"
      >
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Status</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {isActive ? "Active" : "Inactive"}
          </dd>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Analytes</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.analytes?.length ?? 0}
          </dd>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Turnaround</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.turnaround_hours != null ? `${test.turnaround_hours}h` : "—"}
          </dd>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Specimen</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {test.primary_specimen_type_code?.trim() || "—"}
          </dd>
        </div>
      </dl>

      <dl className="divide-y divide-dash-border/70 text-sm">
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-dash-muted">Linked product</dt>
          <dd className="text-right text-brand-navy">
            {test.product?.name?.trim() || "—"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-dash-muted">Created</dt>
          <dd className="text-right text-brand-navy">
            {formatLabDisplayDateTime(test.created_at)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-dash-muted">Updated</dt>
          <dd className="text-right text-brand-navy">
            {formatLabDisplayDateTime(test.updated_at)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
