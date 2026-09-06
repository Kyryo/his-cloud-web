"use client";

import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { RemittanceBatchStatusBadge } from "@/features/claims/components/RemittanceBatchStatusBadge";
import type { RemittanceBatch } from "@/features/claims/types/remittances.types";
import { remittanceDisplayName } from "@/features/claims/utils/remittance-display";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

type RemittancesTableProps = {
  batches: RemittanceBatch[];
  onRowClick?: (batch: RemittanceBatch) => void;
  className?: string;
};

const columns = [
  { key: "file", label: "File" },
  { key: "payer", label: "Payer" },
  { key: "status", label: "Status" },
  { key: "document", label: "Document", className: "hidden md:table-cell" },
  { key: "rows", label: "Rows", className: "hidden lg:table-cell" },
  { key: "matched", label: "Matched", className: "hidden lg:table-cell" },
  { key: "uploaded", label: "Uploaded" },
] as const;

export function RemittancesTable({
  batches,
  onRowClick,
  className,
}: RemittancesTableProps) {
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
        {batches.map((batch) => (
          <ListPageDataTableRow
            key={batch.id}
            className={onRowClick ? "cursor-pointer" : undefined}
            onClick={() => onRowClick?.(batch)}
            data-testid={`remittance-row-${batch.id}`}
          >
            <ListPageDataTableCell className="max-w-[18rem]">
              <p className="truncate text-sm font-medium text-brand-navy">
                {remittanceDisplayName(batch)}
              </p>
              {batch.provider_name ? (
                <p className="truncate text-sm text-brand-muted">
                  {batch.provider_name}
                </p>
              ) : null}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-sm text-brand-slate">
              {batch.payer_code}
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <RemittanceBatchStatusBadge status={batch.status} />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden font-mono text-sm text-brand-slate md:table-cell">
              {batch.document_number || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden text-sm text-brand-slate lg:table-cell">
              {batch.summary?.row_count ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden text-sm text-brand-slate lg:table-cell">
              {batch.summary?.matched ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-sm text-brand-slate">
              {formatDisplayDateTime(batch.created_at)}
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
