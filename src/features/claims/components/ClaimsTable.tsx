"use client";

import { TableTextCell } from "@/components/table-text-cell";
import { Button } from "@/components/ui/button";
import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import type { ClaimListItem } from "@/features/claims/types/claims.types";
import { cn } from "@/lib/utils";

type ClaimsTableProps = {
  claims: ClaimListItem[];
  onRowClick?: (claim: ClaimListItem) => void;
  className?: string;
};

const columns = [
  { key: "customer", label: "Customer" },
  { key: "invoice", label: "Invoice" },
  { key: "payer", label: "Payer" },
  { key: "membership", label: "Membership #" },
  { key: "status", label: "Status" },
  { key: "submitted", label: "Submitted" },
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
    <div className={cn("overflow-hidden rounded-xl border border-brand-border bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-brand-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {claims.map((claim) => (
              <tr
                key={claim.id}
                className={cn(onRowClick && "cursor-pointer hover:bg-slate-50/80")}
                onClick={() => onRowClick?.(claim)}
                data-testid={`claim-row-${claim.id}`}
              >
                <td className="px-4 py-3">
                  <TableTextCell className="font-medium text-brand-navy">
                    {claim.customer_name || "—"}
                  </TableTextCell>
                </td>
                <td className="px-4 py-3">
                  <TableTextCell className="text-brand-slate">
                    {claim.invoice_name || "—"}
                  </TableTextCell>
                </td>
                <td className="px-4 py-3">
                  <TableTextCell className="text-brand-slate">
                    {claim.payer_code || "—"}
                  </TableTextCell>
                </td>
                <td className="px-4 py-3">
                  <TableTextCell className="font-mono text-sm text-brand-slate">
                    {claim.membership_number || "—"}
                  </TableTextCell>
                </td>
                <td className="px-4 py-3 text-sm">
                  <ClaimStatusBadge status={claim.status} />
                </td>
                <td className="px-4 py-3">
                  <TableTextCell className="text-brand-slate">
                    {formatClaimDate(claim.submitted_at)}
                  </TableTextCell>
                </td>
                <td className="px-4 py-3">
                  <TableTextCell className="text-brand-slate">
                    {formatClaimDate(claim.created_at)}
                  </TableTextCell>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ClaimsPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function ClaimsPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: ClaimsPaginationProps) {
  const hasNext = page * pageSize < totalCount;
  const hasPrevious = page > 1;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-brand-muted">
        Showing {claimsRangeLabel(page, pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function claimsRangeLabel(page: number, pageSize: number, totalCount: number) {
  if (totalCount === 0) {
    return "0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  return `${start}-${end}`;
}
