"use client";

import { ListPageBlankState } from "@/features/app-shell/components/page-layout";
import { useLabOrderDetailWorkspace } from "@/features/laboratory/components/detail/lab-order-detail-workspace-context";

export function LabOrderItemsPanel() {
  const { order } = useLabOrderDetailWorkspace();

  if (order.items.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <ListPageBlankState
          compact
          icon="clipboard"
          title="No order items"
          description="Laboratory tests linked to this order will appear here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6" data-testid="lab-order-items-panel">
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Order items</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Tests and panels included on this laboratory order.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-dash-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-dash-canvas/60 text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Test</th>
              <th className="px-4 py-2.5 font-medium">Panel</th>
              <th className="px-4 py-2.5 font-medium">Item status</th>
              <th className="px-4 py-2.5 font-medium">Result status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-border">
            {order.items.map((item) => (
              <tr key={item.uuid}>
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-navy">{item.test_name}</div>
                  <div className="font-mono text-xs text-brand-muted">
                    {item.test_code}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {item.panel_code || "—"}
                </td>
                <td className="px-4 py-3 text-brand-slate">{item.status}</td>
                <td className="px-4 py-3 text-brand-slate">
                  {item.result_status || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
