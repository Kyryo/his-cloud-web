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
import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";

type LabPanelsTableProps = {
  items: LabPanel[];
  deactivatingUuid: string | null;
  onEdit: (item: LabPanel) => void;
  onDeactivate: (item: LabPanel) => void;
};

export function LabPanelsTable({
  items,
  deactivatingUuid,
  onEdit,
  onDeactivate,
}: LabPanelsTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden sm:table-cell">
            Product
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden md:table-cell">
            Tests
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
            data-testid={`lab-panel-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <span className="font-medium text-brand-navy">{item.code}</span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>{item.name}</ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
              {item.product?.name || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {item.tests?.length ?? 0}
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
