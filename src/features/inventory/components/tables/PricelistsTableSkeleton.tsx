import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { PRICELISTS_TABLE_COLUMNS } from "@/features/inventory/components/tables/pricelists-table-columns";

type PricelistsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function PricelistsTableSkeleton({
  rows = 8,
  className,
}: PricelistsTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {PRICELISTS_TABLE_COLUMNS.map((column) => (
            <ListPageDataTableHeaderCell key={column.key}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <ListPageDataTableRow key={index} className="hover:bg-transparent">
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-40" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-12" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-16 rounded-md" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
