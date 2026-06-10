import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SalesOrderLinkedDetailsRow = {
  label: string;
  value: ReactNode;
};

type SalesOrderLinkedDetailsTableProps = {
  rows: SalesOrderLinkedDetailsRow[];
  className?: string;
  "data-testid"?: string;
};

export function SalesOrderLinkedDetailsTable({
  rows,
  className,
  "data-testid": dataTestId,
}: SalesOrderLinkedDetailsTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
      data-testid={dataTestId}
    >
      <table className="min-w-full text-sm">
        <tbody className="divide-y divide-brand-border">
          {rows.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="w-40 bg-slate-50/80 px-4 py-3 text-left font-medium text-brand-muted"
              >
                {row.label}
              </th>
              <td className="px-4 py-3 text-brand-navy">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
