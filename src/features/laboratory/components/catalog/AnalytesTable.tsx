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
import { LabCatalogRowActions } from "@/features/laboratory/components/catalog/LabCatalogPageChrome";
import type { LabAnalyte } from "@/features/laboratory/types/laboratory-catalog.types";

type AnalytesTableProps = {
  items: LabAnalyte[];
  deactivatingUuid: string | null;
  onEdit: (item: LabAnalyte) => void;
  onDeactivate: (item: LabAnalyte) => void;
};

export function AnalytesTable({
  items,
  deactivatingUuid,
  onEdit,
  onDeactivate,
}: AnalytesTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden sm:table-cell">
            Value type
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden md:table-cell">
            Unit
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="text-right">
            Actions
          </ListPageDataTableHeaderCell>
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => (
          <ListPageDataTableRow
            key={item.uuid}
            data-testid={`analyte-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <span className="font-medium text-brand-navy">{item.code}</span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>{item.name}</ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
              {item.value_type}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {item.unit || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <LabCatalogRowActions
                onEdit={() => onEdit(item)}
                onDeactivate={() => onDeactivate(item)}
                isDeactivating={deactivatingUuid === item.uuid}
              />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
