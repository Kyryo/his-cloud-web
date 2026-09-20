"use client";

import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import { useLabPanelDetailWorkspace } from "@/features/laboratory/components/panel-detail/lab-panel-detail-workspace-context";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

export function LabPanelOverviewTabPanel() {
  const { panel } = useLabPanelDetailWorkspace();
  const isActive = panel.is_active !== false;

  return (
    <div data-testid="lab-panel-overview-tab">
      <dl
        className="-mx-4 -mt-4 grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:-mx-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 lg:divide-x"
        aria-label="Laboratory panel overview"
      >
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Status</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {isActive ? "Active" : "Inactive"}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Catalog availability</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Tests</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {panel.tests?.length ?? 0}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Included in panel</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Product</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {panel.product?.name?.trim() || "—"}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Billing link</p>
        </div>
      </dl>

      <section className="mt-6 space-y-3 px-1">
        <h3 className="text-sm font-semibold text-brand-navy">Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Name</dt>
            <dd className="text-right font-medium text-brand-navy">
              {panel.name}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Code</dt>
            <dd className="text-right font-mono font-medium text-brand-navy">
              {panel.code}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Linked product</dt>
            <dd className="text-right font-medium text-brand-navy">
              {panel.product?.name?.trim() || "—"}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Created</dt>
            <dd className="text-right font-medium text-brand-navy">
              {formatLabDisplayDateTime(panel.created_at)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-brand-muted">Updated</dt>
            <dd className="text-right font-medium text-brand-navy">
              {formatLabDisplayDateTime(panel.updated_at)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
