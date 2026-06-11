"use client";

import { PanelRight } from "lucide-react";
import { useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { AddPurchaseOrderLineItemButton } from "@/features/inventory/components/detail/AddPurchaseOrderLineItemButton";
import {
  DetailPageMainAsideGrid,
  DetailPageMainSection,
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { InventorySummaryPanel } from "@/features/inventory/components/InventorySummaryPanel";
import {
  InventoryListTable,
  type InventoryListTableColumn,
} from "@/features/inventory/components/list/InventoryListTable";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatInventoryAmount,
  formatInventoryQuantity,
  formatPurchaseStatusLabel,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type PurchaseOrderDetailTabsProps = {
  order: PurchaseOrder;
  canEditLines?: boolean;
  onManageLines?: () => void;
};

type DetailTabId = "lines" | "summary";

const lineColumns: InventoryListTableColumn<PurchaseOrder["lines"][number]>[] = [
  {
    key: "product",
    label: "Product",
    cellClassName: "font-mono font-medium text-brand-navy",
    render: (line) => line.odoo_product_id,
  },
  {
    key: "qty",
    label: "Qty",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (line) => formatInventoryQuantity(line.quantity),
  },
  {
    key: "unit_cost",
    label: "Unit cost",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (line) => formatInventoryAmount(line.unit_cost),
  },
  {
    key: "total",
    label: "Total",
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: (line) => formatInventoryAmount(line.total_cost),
  },
];

function PurchaseOrderSummaryContent({ order }: { order: PurchaseOrder }) {
  return (
    <InventorySummaryPanel
      className="p-0"
      highlight={
        <dl className="space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-brand-muted">Total value</dt>
            <dd className="font-semibold text-brand-navy">
              {formatInventoryAmount(order.total_value)}
            </dd>
          </div>
        </dl>
      }
      sections={[
        {
          title: "Order summary",
          fields: [
            { label: "Reference", value: order.reference_number },
            { label: "Vendor", value: order.vendor_name },
            { label: "Status", value: formatPurchaseStatusLabel(order.status) },
            { label: "Delivery date", value: formatDisplayDate(order.delivery_date) },
            { label: "LPO number", value: order.lpo_number ?? "—" },
            { label: "GRN number", value: order.grn_number ?? "—" },
            { label: "Created", value: formatDisplayDateTime(order.created_at) },
          ],
        },
      ]}
    />
  );
}

export function PurchaseOrderDetailTabs({
  order,
  canEditLines = false,
  onManageLines,
}: PurchaseOrderDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("lines");
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);

  const summaryPanel = (
    <InventorySummaryPanel
      className={cn(!showSummaryPanel && "hidden xl:block")}
      highlight={
        <dl className="space-y-2.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-brand-muted">Total value</dt>
            <dd className="font-semibold text-brand-navy">
              {formatInventoryAmount(order.total_value)}
            </dd>
          </div>
        </dl>
      }
      sections={[
        {
          title: "Order summary",
          fields: [
            { label: "Reference", value: order.reference_number },
            { label: "Vendor", value: order.vendor_name },
            { label: "Status", value: formatPurchaseStatusLabel(order.status) },
            { label: "Delivery date", value: formatDisplayDate(order.delivery_date) },
            { label: "LPO number", value: order.lpo_number ?? "—" },
            { label: "GRN number", value: order.grn_number ?? "—" },
            { label: "Created", value: formatDisplayDateTime(order.created_at) },
          ],
        },
      ]}
    />
  );

  return (
    <DetailPageTabsSection>
      <DetailPageTabsNavSection aria-label="Purchase order sections">
        <DetailPageTabNavItem
          isActive={activeTab === "lines"}
          onClick={() => setActiveTab("lines")}
        >
          Line items{order.lines.length > 0 ? ` (${order.lines.length})` : ""}
        </DetailPageTabNavItem>
        <DetailPageTabNavItem
          isActive={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </DetailPageTabNavItem>
      </DetailPageTabsNavSection>

      <DetailPageMainAsideGrid>
        <DetailPageMainSection>
          {activeTab === "lines" ? (
            order.lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
                <p className="text-sm font-medium text-brand-navy">No line items yet</p>
                <p className="mt-2 text-sm text-brand-muted">
                  Add products, quantities, and unit costs to this purchase order.
                </p>
                {canEditLines && onManageLines ? (
                  <AddPurchaseOrderLineItemButton
                    className="mt-6"
                    onClick={onManageLines}
                    data-testid="add-purchase-order-line-item-button"
                  />
                ) : null}
              </div>
            ) : (
              <InventoryListTable
                items={order.lines}
                columns={lineColumns}
                getRowKey={(line) =>
                  String(
                    line.id ??
                      `${line.odoo_product_id}-${line.quantity}-${line.unit_cost}`,
                  )
                }
                footer={
                  canEditLines && onManageLines ? (
                    <AddPurchaseOrderLineItemButton
                      onClick={onManageLines}
                      data-testid="add-purchase-order-line-item-button"
                    />
                  ) : undefined
                }
              />
            )
          ) : (
            <div className="rounded-xl border border-brand-border bg-white p-6 xl:hidden">
              <PurchaseOrderSummaryContent order={order} />
            </div>
          )}
        </DetailPageMainSection>

        {summaryPanel}
      </DetailPageMainAsideGrid>

      <FabButton
        label={showSummaryPanel ? "Hide summary" : "Show summary"}
        icon={PanelRight}
        variant="outline"
        hideFrom="xl"
        className="bg-white"
        onClick={() => setShowSummaryPanel((current) => !current)}
      />
    </DetailPageTabsSection>
  );
}
