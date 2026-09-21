"use client";

import { Badge } from "@/components/ui/badge";
import {
  ListPageBlankState,
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";
import {
  formatLabOrderItemStatusLabel,
  formatLabResultStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";

export function LabOrderItemsPanel() {
  const { order } = useLabOrderDetailWorkspace();

  if (order.items.length === 0) {
    return (
      <ListPageBlankState
        compact
        icon="clipboard"
        title="No order items"
        description="Laboratory tests linked to this order will appear here."
      />
    );
  }

  return (
    <div data-testid="lab-order-items-panel">
      <ListPageDataTable>
        <ListPageDataTableHeader>
          <ListPageDataTableHeaderRow>
            <ListPageDataTableHeaderCell>Test</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell className="hidden sm:table-cell">
              Panel
            </ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell>Item</ListPageDataTableHeaderCell>
            <ListPageDataTableHeaderCell>Result</ListPageDataTableHeaderCell>
          </ListPageDataTableHeaderRow>
        </ListPageDataTableHeader>
        <ListPageDataTableBody>
          {order.items.map((item) => (
            <ListPageDataTableRow key={item.uuid}>
              <ListPageDataTableCell>
                <p className="font-medium text-brand-navy">{item.test_name}</p>
                <p className="font-mono text-xs text-dash-muted">
                  {item.test_code}
                </p>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden sm:table-cell text-brand-slate">
                {item.panel_code || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <Badge variant="outline" className="font-normal">
                  {formatLabOrderItemStatusLabel(item.status)}
                </Badge>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <span className="text-sm text-brand-slate">
                  {formatLabResultStatusLabel(item.result_status)}
                </span>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          ))}
        </ListPageDataTableBody>
      </ListPageDataTable>
    </div>
  );
}
