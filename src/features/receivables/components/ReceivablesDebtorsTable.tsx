"use client";

import { TableAmountCell } from "@/components/table-text-cell";
import { UserIdenticon } from "@/components/UserIdenticon";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import type { ReceivablesDebtor } from "@/features/receivables/types/receivables.types";
import {
  formatReceivablesClientName,
  formatReceivablesIdentifier,
  getReceivablesDueSource,
} from "@/features/receivables/utils/format-receivables";

type ReceivablesDebtorsTableProps = {
  debtors: ReceivablesDebtor[];
  onRowClick?: (debtor: ReceivablesDebtor) => void;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "opening", label: "Opening", align: "right" as const },
  { key: "invoiced", label: "Invoiced", align: "right" as const },
  { key: "paid", label: "Paid", align: "right" as const },
  { key: "due", label: "Due", align: "right" as const },
] as const;

export const RECEIVABLES_DEBTORS_SKELETON_COLUMNS = columns;

export function ReceivablesDebtorsTable({
  debtors,
  onRowClick,
}: ReceivablesDebtorsTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : undefined
              }
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {debtors.map((debtor) => {
          const name = formatReceivablesClientName(debtor.customer_name);
          const identifier = formatReceivablesIdentifier(
            debtor.customer_identifier,
          );

          return (
            <ListPageDataTableRow
              key={debtor.customer_uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => onRowClick?.(debtor)}
              data-testid={`receivables-debtor-${debtor.customer_uuid}`}
            >
              <ListPageDataTableCell className="py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={debtor.customer_uuid || name}
                    name={name}
                    className="size-8 shrink-0 rounded-lg shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-navy group-hover:text-brand-primary">
                      {name}
                    </p>
                    <p
                      className="truncate font-mono text-xs text-brand-muted"
                      title={debtor.customer_identifier ?? undefined}
                    >
                      {identifier}
                      <span className="ml-2 font-sans text-dash-muted">
                        {getReceivablesDueSource(debtor)}
                      </span>
                    </p>
                  </div>
                </div>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <TableAmountCell value={debtor.opening_balance} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <TableAmountCell value={debtor.total_invoiced} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <TableAmountCell value={debtor.total_paid} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <TableAmountCell
                  value={debtor.total_due}
                  className="font-semibold"
                />
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
