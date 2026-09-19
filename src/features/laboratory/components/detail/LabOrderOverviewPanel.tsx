"use client";

import Link from "next/link";
import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
  ListPageBlankState,
} from "@/features/app-shell/components/page-layout";
import { AddClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/AddClinicalOrderDialog";
import { useMyClinicalCapabilities } from "@/features/clinical-opd/hooks/use-clinical-opd";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import {
  formatLabOrderPriorityLabel,
  formatLabOrderItemStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";
import { labOrderDetailTabHref } from "@/features/laboratory/utils/lab-order-detail-tabs";

export function LabOrderOverviewPanel() {
  const { order, onRefresh } = useLabOrderDetailWorkspace();
  const { data: capabilitiesData } = useMyClinicalCapabilities();
  const [addTestOpen, setAddTestOpen] = useState(false);
  const items = order.items;
  const itemCount = items.length;
  const releasedCount = items.filter(
    (item) => item.status === "RELEASED" || item.result_status === "RELEASED",
  ).length;
  const capabilities = capabilitiesData?.capabilities ?? ["order_laboratory"];

  function handleAddDialogOpenChange(open: boolean) {
    setAddTestOpen(open);
    if (!open) {
      onRefresh();
    }
  }

  return (
    <div data-testid="lab-order-overview-panel">
      <dl
        className="-mx-4 -mt-4 grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 sm:-mx-6 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        aria-label="Laboratory order overview"
        data-testid="lab-order-overview-stats"
      >
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Status</dt>
          <dd className="mt-1.5">
            <LabOrderStatusBadge status={order.status} />
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Current workflow</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Priority</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {formatLabOrderPriorityLabel(order.priority)}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Order urgency</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Items</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>{itemCount}</dd>
          <p className="mt-0.5 text-xs text-brand-muted">Tests on this order</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Released</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {releasedCount}/{itemCount || 0}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Results released</p>
        </div>
      </dl>

      {itemCount === 0 ? (
        <div className="pt-5">
          <ListPageBlankState
            compact
            icon="flask"
            title="No tests ordered"
            description="Laboratory tests for this encounter will appear here."
            data-testid="lab-order-overview-empty"
            action={
              <PageActionButton
                type="button"
                onClick={() => setAddTestOpen(true)}
                data-testid="lab-order-add-test-button"
              >
                <AppIcon name="add" className="size-3.5" />
                Add test
              </PageActionButton>
            }
          />
        </div>
      ) : (
        <section className="pt-5" aria-labelledby="lab-ordered-tests-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2
                id="lab-ordered-tests-heading"
                className="text-base font-semibold text-brand-navy"
              >
                Ordered tests
              </h2>
              <p className="mt-0.5 text-sm text-brand-muted">
                Tests and panels placed for this encounter.
              </p>
            </div>
            <Link
              href={labOrderDetailTabHref(order.uuid, "items")}
              className="shrink-0 text-sm font-medium text-brand-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <ul className="divide-y divide-dash-border/70 border-y border-dash-border/80">
            {items.map((item) => (
              <li
                key={item.uuid}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-navy">
                    {item.test_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-brand-muted">
                    {item.test_code}
                    {item.panel_code ? ` · Panel ${item.panel_code}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant="outline" className="font-normal">
                    {formatLabOrderItemStatusLabel(item.status)}
                  </Badge>
                  {item.result_status ? (
                    <span className="text-[11px] text-brand-muted">
                      {item.result_status}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AddClinicalOrderDialog
        visitUuid={order.visit_uuid}
        encounterUuid={order.encounter_uuid}
        capabilities={capabilities}
        open={addTestOpen}
        onOpenChange={handleAddDialogOpenChange}
      />
    </div>
  );
}
