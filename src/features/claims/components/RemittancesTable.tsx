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
  { key: "document", label: "Document" },
  { key: "rows", label: "Rows" },
  { key: "matched", label: "Matched" },
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
            <ListPageDataTableHeaderCell key={column.key}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {batches.length === 0 ? (
          <ListPageDataTableRow>
            <ListPageDataTableCell
              colSpan={columns.length}
              className="py-10 text-center text-sm text-brand-muted"
            >
              No remittances uploaded yet.
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ) : (
          batches.map((batch) => (
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
                  <p className="truncate text-xs text-brand-muted">
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
              <ListPageDataTableCell className="font-mono text-sm text-brand-slate">
                {batch.document_number || "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="text-sm text-brand-slate">
                {batch.summary?.row_count ?? "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="text-sm text-brand-slate">
                {batch.summary?.matched ?? "—"}
              </ListPageDataTableCell>
              <ListPageDataTableCell className="text-sm text-brand-slate">
                {formatDisplayDateTime(batch.created_at)}
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          ))
        )}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
