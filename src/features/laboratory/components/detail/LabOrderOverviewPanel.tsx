"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LIST_PAGE_INSIGHT_CELL_CLASS,
  LIST_PAGE_INSIGHT_LABEL_CLASS,
  LIST_PAGE_INSIGHT_VALUE_CLASS,
  ListPageBlankState,
} from "@/features/app-shell/components/page-layout";
import { AddClinicalOrderDialog } from "@/features/clinical-opd/components/tabs/AddClinicalOrderDialog";
import { useMyClinicalCapabilities } from "@/features/clinical-opd/hooks/use-clinical-opd";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import { LabOrderDetailWorkflowActions } from "@/features/laboratory/components/detail/LabOrderDetailWorkflowActions";
import { LabOrderFetchResultsButton } from "@/features/laboratory/components/detail/LabOrderFetchResultsButton";
import { LabOrderTestResultCard } from "@/features/laboratory/components/detail/LabOrderTestResultCard";
import {
  LabOrderedTestsViewToggle,
  type LabOrderedTestsViewMode,
} from "@/features/laboratory/components/detail/LabOrderedTestsViewToggle";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import type {
  LabOrderItem,
  LabOrderedProduct,
} from "@/features/laboratory/types/laboratory.types";
import {
  formatLabOrderPriorityLabel,
  formatLabOrderItemStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";
import {
  DEFAULT_LAB_ORDERED_TESTS_VIEW,
  readLabOrderedTestsViewMode,
  writeLabOrderedTestsViewMode,
} from "@/features/laboratory/utils/lab-ordered-tests-view";
import { sortLabOrderItems } from "@/features/laboratory/utils/sort-lab-order-items";
import { cn } from "@/lib/utils";

const DEFAULT_ORDER_CAPABILITIES = ["order_laboratory"] as const;

function itemsForProduct(
  items: LabOrderItem[],
  product: LabOrderedProduct,
): LabOrderItem[] {
  if (product.visit_order_uuid) {
    const matched = items.filter(
      (item) => item.visit_order_uuid === product.visit_order_uuid,
    );
    if (matched.length > 0) {
      return sortLabOrderItems(matched);
    }
  }

  if (product.panel_uuid) {
    const matched = items.filter(
      (item) => item.panel_uuid === product.panel_uuid,
    );
    if (matched.length > 0) {
      return sortLabOrderItems(matched);
    }
  }

  if (product.item_count === 1) {
    const unmatched = items.filter((item) => !item.visit_order_uuid);
    if (unmatched.length === 1) {
      return unmatched;
    }
  }

  return [];
}

function ProductOrderCard({
  product,
  items,
  defaultOpen,
  viewMode,
  onSaved,
}: {
  product: LabOrderedProduct;
  items: LabOrderItem[];
  defaultOpen: boolean;
  viewMode: LabOrderedTestsViewMode;
  onSaved: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isCards = viewMode === "cards";
  const productKey =
    product.visit_order_uuid ??
    `${product.product_uuid ?? "product"}-${product.product_name}`;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        isCards
          ? "overflow-hidden rounded-xl border border-dash-border/80 bg-white"
          : "border-t border-dash-border/80 first:border-t-0",
      )}
      data-testid={`lab-order-product-card-${productKey}`}
      data-view={viewMode}
    >
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-3 text-left",
          isCards
            ? "px-4 py-3.5 transition-colors hover:bg-slate-50/80"
            : "py-3.5",
        )}
        data-testid={`lab-order-product-toggle-${productKey}`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {product.product_name}
          </p>
          <p
            className={cn(
              "mt-0.5 truncate text-xs",
              isCards ? "text-brand-muted" : "text-dash-muted",
            )}
          >
            {[
              product.product_code || null,
              product.panel_code ? `Panel ${product.panel_code}` : null,
              `${items.length || product.item_count} test${
                (items.length || product.item_count) === 1 ? "" : "s"
              }`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 font-normal">
          {formatLabOrderItemStatusLabel(product.status)}
        </Badge>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            isCards ? "text-brand-muted" : "text-dash-muted",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(isCards && "border-t border-dash-border/70")}
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-start gap-1.5",
            isCards ? "bg-slate-50/40 px-4 pt-3" : "pt-1 pb-2",
          )}
          data-testid={`lab-order-workflow-actions-${productKey}`}
        >
          <LabOrderDetailWorkflowActions
            items={items}
            testId={`lab-action-submit-${productKey}`}
          />
          <LabOrderFetchResultsButton
            testId={`lab-action-fetch-results-${productKey}`}
          />
        </div>
        {items.length === 0 ? (
          <p
            className={cn(
              "text-sm",
              isCards
                ? "bg-slate-50/40 px-4 pb-4 text-brand-muted"
                : "pb-4 text-dash-muted",
            )}
          >
            No expanded tests for this product yet.
          </p>
        ) : isCards ? (
          <div className="bg-slate-50/40 px-4 pb-4 pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <LabOrderTestResultCard
                  key={item.uuid}
                  item={item}
                  layout="card"
                  enabled={open}
                  onSaved={onSaved}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="pb-2">
            {items.map((item) => (
              <LabOrderTestResultCard
                key={item.uuid}
                item={item}
                layout="list"
                enabled={open}
                onSaved={onSaved}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LabOrderOverviewPanel() {
  const { order, onRefresh } = useLabOrderDetailWorkspace();
  const { data: capabilitiesData } = useMyClinicalCapabilities();
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [viewMode, setViewMode] = useState<LabOrderedTestsViewMode>(
    DEFAULT_LAB_ORDERED_TESTS_VIEW,
  );
  const items = order.items;
  const orderedProducts = useMemo(
    () => order.ordered_products ?? [],
    [order.ordered_products],
  );
  const itemCount = items.length;
  const productCount = orderedProducts.length;
  const releasedCount = items.filter(
    (item) => item.status === "RELEASED" || item.result_status === "RELEASED",
  ).length;
  const capabilities =
    capabilitiesData?.capabilities ?? DEFAULT_ORDER_CAPABILITIES;

  useEffect(() => {
    setViewMode(readLabOrderedTestsViewMode());
  }, []);

  const productItems = useMemo(
    () =>
      orderedProducts.map((product) => ({
        product,
        items: itemsForProduct(items, product),
      })),
    [items, orderedProducts],
  );

  function handleViewModeChange(mode: LabOrderedTestsViewMode) {
    setViewMode(mode);
    writeLabOrderedTestsViewMode(mode);
  }

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
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Ordered</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>{productCount}</dd>
          <p className="mt-0.5 text-xs text-brand-muted">Products on this order</p>
        </div>
        <div className={LIST_PAGE_INSIGHT_CELL_CLASS}>
          <dt className={LIST_PAGE_INSIGHT_LABEL_CLASS}>Released</dt>
          <dd className={LIST_PAGE_INSIGHT_VALUE_CLASS}>
            {releasedCount}/{itemCount || 0}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Results released</p>
        </div>
      </dl>

      {productCount === 0 ? (
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
        <section
          className={cn("pt-5", viewMode === "cards" && "space-y-3")}
          aria-labelledby="lab-ordered-products-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="lab-ordered-products-heading"
              className="text-sm font-semibold text-brand-navy"
            >
              Ordered tests
            </h2>
            <LabOrderedTestsViewToggle
              viewMode={viewMode}
              onChange={handleViewModeChange}
            />
          </div>

          <div
            className={cn(viewMode === "cards" && "space-y-3")}
            data-testid="lab-ordered-products-list"
            data-view={viewMode}
          >
            {productItems.map(({ product, items: productTests }, index) => (
              <ProductOrderCard
                key={
                  product.visit_order_uuid ??
                  `${product.product_uuid ?? "product"}-${product.product_name}-${index}`
                }
                product={product}
                items={productTests}
                defaultOpen={index === 0}
                viewMode={viewMode}
                onSaved={onRefresh}
              />
            ))}
          </div>
        </section>
      )}

      {addTestOpen ? (
        <AddClinicalOrderDialog
          visitUuid={order.visit_uuid}
          encounterUuid={order.encounter_uuid}
          capabilities={capabilities}
          open={addTestOpen}
          onOpenChange={handleAddDialogOpenChange}
        />
      ) : null}
    </div>
  );
}
