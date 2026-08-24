"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import type { RemittanceRow } from "@/features/claims/types/remittances.types";

type RemittanceRowsTableProps = {
  rows: RemittanceRow[];
  busyRowId: number | null;
  onView: (row: RemittanceRow) => void;
  onApply: (row: RemittanceRow) => void;
  onReject: (row: RemittanceRow) => void;
  className?: string;
};

const columns = [
  { key: "row", label: "#" },
  { key: "treatment_date", label: "Treatment date" },
  { key: "member", label: "Member #" },
  { key: "patient", label: "Patient" },
  { key: "code", label: "Code" },
  { key: "claimed", label: "Claimed" },
  { key: "pay_to_you", label: "Pay to you" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

function formatResolutionStatus(status: RemittanceRow["resolution_status"]): string {
  return status.replace(/_/g, " ");
}

function canApply(row: RemittanceRow): boolean {
  return Boolean(
    row.matched_claim_id &&
      row.resolution_status !== "auto_applied" &&
      row.resolution_status !== "manually_resolved" &&
      row.resolution_status !== "rejected",
  );
}

function canReject(row: RemittanceRow): boolean {
  return (
    row.resolution_status !== "rejected" &&
    row.resolution_status !== "auto_applied" &&
    row.resolution_status !== "manually_resolved"
  );
}

export function RemittanceRowsTable({
  rows,
  busyRowId,
  onView,
  onApply,
  onReject,
  className,
}: RemittanceRowsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={column.key === "actions" ? "w-12 text-right" : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {rows.length === 0 ? (
          <ListPageDataTableRow>
            <ListPageDataTableCell
              colSpan={columns.length}
              className="py-8 text-center text-sm text-brand-muted"
            >
              No line items in this remittance.
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ) : (
          rows.map((row) => {
            const applyEnabled = canApply(row);
            const rejectEnabled = canReject(row);
            const isBusy = busyRowId === row.id;

            return (
              <ListPageDataTableRow key={row.id}>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {row.source_row_number}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="whitespace-nowrap text-sm text-brand-slate">
                  {row.service_date || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="font-mono text-sm text-brand-slate">
                  {row.member_number || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm font-medium text-brand-navy">
                  {row.patient_name || row.member_name || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {row.procedure_code || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {row.amount_claimed ?? "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {row.pay_to_provider ?? "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm text-brand-slate">
                  {row.reason_code ? (
                    <span className="font-mono text-xs">{row.reason_code}</span>
                  ) : (
                    "—"
                  )}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm capitalize text-brand-slate">
                  {formatResolutionStatus(row.resolution_status)}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        disabled={isBusy}
                        aria-label="Row actions"
                        data-testid={`remittance-row-actions-${row.id}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onView(row)}>
                        View
                      </DropdownMenuItem>
                      {applyEnabled ? (
                        <DropdownMenuItem
                          disabled={isBusy}
                          onClick={() => onApply(row)}
                        >
                          Apply
                        </DropdownMenuItem>
                      ) : null}
                      {rejectEnabled ? (
                        <DropdownMenuItem
                          disabled={isBusy}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onReject(row)}
                        >
                          Reject
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })
        )}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
