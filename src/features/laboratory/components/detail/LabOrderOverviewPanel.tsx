"use client";

import Link from "next/link";

import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_STRIP_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
} from "@/features/app-shell/components/page-layout";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import {
  formatLabAccession,
  formatLabDisplayDateTime,
  formatLabOrderPriorityLabel,
  shortenUuid,
} from "@/features/laboratory/utils/format-lab-order";
import { ROUTES } from "@/constants/routes";

export function LabOrderOverviewPanel() {
  const { order, specimens } = useLabOrderDetailWorkspace();
  const itemCount = order.items.length;
  const releasedCount = order.items.filter(
    (item) => item.status === "RELEASED" || item.result_status === "RELEASED",
  ).length;

  return (
    <div className="space-y-5 p-4 sm:p-6" data-testid="lab-order-overview-panel">
      <div
        className={LIST_PAGE_INSIGHT_STRIP_CLASS}
        aria-label="Laboratory order overview"
      >
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <p className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Status</p>
          <div className="mt-1.5">
            <LabOrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <p className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Priority</p>
          <p className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatLabOrderPriorityLabel(order.priority)}
          </p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <p className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Items</p>
          <p className={LIST_PAGE_INSIGHT_VALUE_CLASS}>{itemCount}</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <p className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Released</p>
          <p className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {releasedCount}/{itemCount || 0}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-dash-border bg-white">
        <div className="border-b border-dash-border/80 bg-slate-50/70 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-brand-navy">Order details</h2>
        </div>
        <dl className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Accession
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-brand-navy">
              {formatLabAccession(order)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Patient
            </dt>
            <dd className="mt-1">
              <Link
                href={ROUTES.customerDetail(order.customer_uuid)}
                className="font-mono text-sm font-medium text-brand-primary hover:underline"
              >
                {shortenUuid(order.customer_uuid)}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Clinic
            </dt>
            <dd className="mt-1 text-sm text-brand-navy">
              {order.clinic_name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Ordered
            </dt>
            <dd className="mt-1 text-sm text-brand-navy">
              {formatLabDisplayDateTime(order.ordered_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Ordered by
            </dt>
            <dd className="mt-1 text-sm text-brand-navy">
              {order.ordered_by_name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Specimens (session)
            </dt>
            <dd className="mt-1 text-sm text-brand-navy">{specimens.length}</dd>
          </div>
        </dl>
        {order.clinical_notes ? (
          <div className="border-t border-dash-border/80 px-4 py-4 sm:px-5">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Clinical notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-brand-slate">
              {order.clinical_notes}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
