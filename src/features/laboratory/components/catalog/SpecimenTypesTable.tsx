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
import type { LabSpecimenType } from "@/features/laboratory/types/laboratory-catalog.types";

type SpecimenTypesTableProps = {
  items: LabSpecimenType[];
  deactivatingUuid: string | null;
  onEdit: (item: LabSpecimenType) => void;
  onDeactivate: (item: LabSpecimenType) => void;
};

export function SpecimenTypesTable({
  items,
  deactivatingUuid,
  onEdit,
  onDeactivate,
}: SpecimenTypesTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden sm:table-cell">
            Container
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden md:table-cell">
            Volume
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
            data-testid={`specimen-type-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <span className="font-medium text-brand-navy">{item.code}</span>
            </ListPageDataTableCell>
            <ListPageDataTableCell>{item.name}</ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
              {item.container || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {item.volume != null
                ? `${item.volume}${item.volume_unit ? ` ${item.volume_unit}` : ""}`
                : "—"}
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
