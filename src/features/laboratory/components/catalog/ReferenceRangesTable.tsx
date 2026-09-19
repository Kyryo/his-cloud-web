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
import type { LabReferenceRange } from "@/features/laboratory/types/laboratory-catalog.types";

type ReferenceRangesTableProps = {
  items: LabReferenceRange[];
  deactivatingUuid: string | null;
  onEdit: (item: LabReferenceRange) => void;
  onDeactivate: (item: LabReferenceRange) => void;
};

function formatLimit(value: string | number | null | undefined): string {
  return value == null || value === "" ? "—" : String(value);
}

export function ReferenceRangesTable({
  items,
  deactivatingUuid,
  onEdit,
  onDeactivate,
}: ReferenceRangesTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Analyte</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden sm:table-cell">
            Sex
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden md:table-cell">
            Normal
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden lg:table-cell">
            Effective
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
            data-testid={`reference-range-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-navy">
                  {item.analyte_code}
                </p>
                <p className="truncate text-[12px] text-brand-muted">
                  {item.analyte_name}
                </p>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
              {item.sex}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {formatLimit(item.low_normal)} – {formatLimit(item.high_normal)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell text-brand-muted">
              {item.effective_from}
              {item.effective_to ? ` → ${item.effective_to}` : ""}
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
