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
import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type LabPanelsTableProps = {
  items: LabPanel[];
  deactivatingUuid: string | null;
  onRowClick?: (item: LabPanel) => void;
  onEdit: (item: LabPanel) => void;
  onDeactivate: (item: LabPanel) => void;
};

export function LabPanelsTable({
  items,
  deactivatingUuid,
  onRowClick,
  onEdit,
  onDeactivate,
}: LabPanelsTableProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Name</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Code</ListPageDataTableHeaderCell>
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
            className={cn("group", onRowClick && "cursor-pointer")}
            onClick={() => onRowClick?.(item)}
            data-testid={`lab-panel-row-${item.uuid}`}
          >
            <ListPageDataTableCell>
              <Link
                href={ROUTES.labPanelDetail(item.uuid)}
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
              {item.product?.name || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell text-brand-muted">
              {item.tests?.length ?? 0}
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
