"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { RemittanceRowResolutionStatusBadge } from "@/features/claims/components/RemittanceRowResolutionStatusBadge";
import type { RemittanceRow } from "@/features/claims/types/remittances.types";

type RemittanceRowsTableProps = {
  rows: RemittanceRow[];
  busyRowId: number | null;
  onView: (row: RemittanceRow) => void;
  onMatch: (row: RemittanceRow) => void;
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
  { key: "claimed", label: "Claimed", align: "right" as const },
  { key: "pay_to_you", label: "Pay to you", align: "right" as const },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" },
  { key: "actions", label: "", align: "right" as const },
] as const;

export const REMITTANCE_ROWS_TABLE_SKELETON_COLUMNS = columns.map((column) => ({
  key: column.key,
  label: column.label,
  headerClassName:
    "align" in column && column.align === "right"
      ? "text-right"
      : column.key === "actions"
        ? "w-12"
        : undefined,
}));

function columnHeaderClass(key: string, align?: "right") {
  if (align === "right" || key === "actions") {
    return "text-right";
  }
  return undefined;
}

function hasRejectionReason(row: RemittanceRow): boolean {
  return Boolean(row.reason_code?.trim());
}

function canMatch(row: RemittanceRow): boolean {
  return (
    !row.matched_claim_id &&
    row.resolution_status !== "rejected" &&
    row.resolution_status !== "auto_applied" &&
    row.resolution_status !== "manually_resolved"
  );
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

function isAppliedRemittanceRow(row: RemittanceRow): boolean {
  return (
    row.resolution_status === "auto_applied" ||
    row.resolution_status === "manually_resolved"
  );
}

export function RemittanceRowsTable({
  rows,
  busyRowId,
  onView,
  onMatch,
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
              className={columnHeaderClass(
                column.key,
                "align" in column ? column.align : undefined,
              )}
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
            const matchEnabled = canMatch(row);
            const rejectEnabled = canReject(row);
            const showLinkedRecords = isAppliedRemittanceRow(row);
            const claimRef = row.matched_claim_uuid ?? row.matched_claim_id;
            const invoiceRef = row.matched_invoice_uuid ?? row.matched_invoice_id;
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
                <ListPageDataTableCell className="text-right text-sm tabular-nums text-brand-slate">
                  {row.amount_claimed ?? "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-right text-sm tabular-nums text-brand-slate">
                  {row.pay_to_provider ?? "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm">
                  {hasRejectionReason(row) ? (
                    <span className="font-mono text-sm text-red-600">
                      {row.reason_code}
                    </span>
                  ) : (
                    "—"
                  )}
                </ListPageDataTableCell>
                <ListPageDataTableCell>
                  <RemittanceRowResolutionStatusBadge
                    status={row.resolution_status}
                  />
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
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onView(row)}>
                        View line item
                      </DropdownMenuItem>
                      {showLinkedRecords && claimRef ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href={ROUTES.claimDetail(claimRef)}
                            data-testid={`remittance-row-view-claim-${row.id}`}
                          >
                            View claim
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      {showLinkedRecords && invoiceRef ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href={ROUTES.invoiceDetail(invoiceRef)}
                            data-testid={`remittance-row-view-invoice-${row.id}`}
                          >
                            View invoice
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      {showLinkedRecords && (claimRef || invoiceRef) ? (
                        <DropdownMenuSeparator />
                      ) : null}
                      {matchEnabled ? (
                        <DropdownMenuItem
                          disabled={isBusy}
                          onClick={() => onMatch(row)}
                        >
                          Match claim
                        </DropdownMenuItem>
                      ) : null}
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
