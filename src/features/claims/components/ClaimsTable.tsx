"use client";

import { TableTextCell } from "@/components/table-text-cell";
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
          const displayName = clientName || "Unknown client";
          const identiconSeed =
            claim.customer_uuid?.trim() ||
            claim.membership_number?.trim() ||
            displayName;

          return (
            <ListPageDataTableRow
              key={claim.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(claim)}
              data-testid={`claim-row-${claim.id}`}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 max-w-[16rem] items-center gap-2.5">
                  <UserIdenticon
                    seed={identiconSeed}
                    name={displayName}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <TableTextCell
                    className={
                      clientName
                        ? "font-medium text-brand-navy"
                        : "text-brand-muted"
                    }
                    title={displayName}
                  >
                    {displayName}
                  </TableTextCell>
                </div>
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
