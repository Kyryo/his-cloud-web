"use client";

import { TableEntityCell, TableTextCell } from "@/components/table-text-cell";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { ClaimPayerStatusBadge } from "@/features/claims/components/ClaimPayerStatusBadge";
import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import type { ClaimListItem } from "@/features/claims/types/claims.types";

type ClaimsTableProps = {
  claims: ClaimListItem[];
  onRowClick?: (claim: ClaimListItem) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "invoice", label: "Invoice" },
  { key: "payer", label: "Payer" },
  { key: "membership", label: "Membership #", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "payer_status", label: "Payer status", className: "hidden lg:table-cell" },
  { key: "submitted", label: "Submitted", className: "hidden lg:table-cell" },
  { key: "created", label: "Created" },
] as const;

function formatClaimDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ClaimsTable({ claims, onRowClick, className }: ClaimsTableProps) {
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
        {claims.map((claim) => {
          const clientName = claim.customer_name?.trim() || "";
          return (
            <ListPageDataTableRow
              key={claim.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(claim)}
              data-testid={`claim-row-${claim.id}`}
            >
              <ListPageDataTableCell>
                <TableEntityCell
                  name={clientName || "Unknown client"}
                  unassigned={!clientName}
                  unassignedLabel="—"
                  className="max-w-[16rem] font-medium text-brand-navy"
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <TableTextCell className="text-brand-slate">
                  {claim.invoice_name || "—"}
                </TableTextCell>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <TableTextCell className="text-brand-slate">
                  {claim.payer_code || "—"}
                </TableTextCell>
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden md:table-cell">
                <TableTextCell className="font-mono text-sm text-brand-slate">
                  {claim.membership_number || "—"}
                </TableTextCell>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <ClaimStatusBadge status={claim.status} />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                <ClaimPayerStatusBadge
                  status={claim.payer_status}
                  label={claim.payer_status_label}
                />
              </ListPageDataTableCell>
              <ListPageDataTableCell className="hidden lg:table-cell">
                <TableTextCell className="text-brand-slate">
                  {formatClaimDate(claim.submitted_at)}
                </TableTextCell>
              </ListPageDataTableCell>
              <ListPageDataTableCell>
                <TableTextCell className="text-brand-slate">
                  {formatClaimDate(claim.created_at)}
                </TableTextCell>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
