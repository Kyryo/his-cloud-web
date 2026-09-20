"use client";

import Link from "next/link";

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
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type LabTestsTableProps = {
  items: LabTestDefinition[];
  deactivatingUuid: string | null;
  onRowClick?: (item: LabTestDefinition) => void;
  onEdit: (item: LabTestDefinition) => void;
  onDeactivate: (item: LabTestDefinition) => void;
};

export function LabTestsTable({
  items,
  deactivatingUuid,
  onRowClick,
  onEdit,
  onDeactivate,
}: LabTestsTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden sm:table-cell">
            Category
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="hidden md:table-cell">
            Analytes
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
            className={cn("group", onRowClick && "cursor-pointer")}
            onClick={() => onRowClick?.(item)}
            data-testid={`lab-test-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <Link
                href={ROUTES.labTestDetail(item.uuid)}
                onClick={(event) => event.stopPropagation()}
                className="font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
              >
                {item.name}
              </Link>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <span className="font-mono text-sm text-brand-muted">
                {item.code}
              </span>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell text-brand-muted">
              {item.category || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {item.analytes?.length ?? 0}
            </ListPageDataTableCell>
            <ListPageDataTableCell
              onClick={(event) => event.stopPropagation()}
            >
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
