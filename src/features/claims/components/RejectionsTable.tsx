"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

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
import { ROUTES } from "@/constants/routes";
import type { RemittanceRejectionRow } from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";

type RejectionsTableProps = {
  rows: RemittanceRejectionRow[];
  onRowClick?: (row: RemittanceRejectionRow) => void;
  className?: string;
};

const columns = [
  { key: "remittance", label: "Remittance" },
  {
    key: "treatment_date",
    label: "Treatment date",
    className: "hidden md:table-cell",
  },
  { key: "member", label: "Member #" },
  { key: "patient", label: "Patient" },
  { key: "code", label: "Code", className: "hidden lg:table-cell" },
  {
    key: "claimed",
    label: "Claimed",
    className: "hidden text-right lg:table-cell",
  },
  {
    key: "pay_to_you",
    label: "Pay to you",
    className: "hidden text-right xl:table-cell",
  },
  { key: "reason", label: "Reason" },
  { key: "actions", label: "", className: "w-12 text-right" },
] as const;

function hasRejectionReason(row: RemittanceRejectionRow): boolean {
  return Boolean(row.reason_code?.trim());
}

export function RejectionsTable({
  rows,
  onRowClick,
  className,
}: RejectionsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={"className" in column ? column.className : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {rows.map((row) => {
            const claimRef = row.matched_claim_uuid ?? row.matched_claim_id;
            const invoiceRef = row.matched_invoice_uuid ?? row.matched_invoice_id;

            return (
              <ListPageDataTableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(row)}
                data-testid={`rejection-row-${row.id}`}
              >
                <ListPageDataTableCell className="max-w-[16rem]">
                  <Link
                    href={ROUTES.remittanceDetail(row.batch_uuid)}
                    className="truncate text-sm font-medium text-brand-primary hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {remittanceDisplayName({
                      id: row.batch_id,
                      display_filename: row.batch_display_filename,
                      original_filename: row.batch_display_filename,
                    })}
                  </Link>
                  <p className="truncate text-sm text-brand-muted">
                    {row.batch_payer_code}
                  </p>
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden whitespace-nowrap text-sm text-brand-slate md:table-cell">
                  {row.service_date || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="font-mono text-sm text-brand-slate">
                  {row.member_number || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="text-sm font-medium text-brand-navy">
                  {row.patient_name || row.member_name || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden text-sm text-brand-slate lg:table-cell">
                  {row.procedure_code || "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden text-right text-sm tabular-nums text-brand-slate lg:table-cell">
                  {row.amount_claimed ?? "—"}
                </ListPageDataTableCell>
                <ListPageDataTableCell className="hidden text-right text-sm tabular-nums text-brand-slate xl:table-cell">
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
                <ListPageDataTableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8 rounded-full"
                        aria-label="Rejection row actions"
                        onClick={(event) => event.stopPropagation()}
                        data-testid={`rejection-row-actions-${row.id}`}
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        disabled={!claimRef}
                        asChild={Boolean(claimRef)}
                        data-testid={`rejection-row-view-claim-${row.id}`}
                      >
                        {claimRef ? (
                          <Link
                            href={ROUTES.claimDetail(claimRef)}
                            onClick={(event) => event.stopPropagation()}
                          >
                            View claim
                          </Link>
                        ) : (
                          <span>View claim</span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!invoiceRef}
                        asChild={Boolean(invoiceRef)}
                        data-testid={`rejection-row-view-invoice-${row.id}`}
                      >
                        {invoiceRef ? (
                          <Link
                            href={ROUTES.invoiceDetail(invoiceRef)}
                            onClick={(event) => event.stopPropagation()}
                          >
                            View invoice
                          </Link>
                        ) : (
                          <span>View invoice</span>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ListPageDataTableCell>
              </ListPageDataTableRow>
            );
          })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
