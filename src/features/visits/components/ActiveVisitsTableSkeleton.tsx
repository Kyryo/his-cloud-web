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
import { ACTIVE_VISITS_TABLE_SKELETON_COLUMNS } from "@/features/visits/components/tables/active-visits-table";

type ActiveVisitsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function ActiveVisitsTableSkeleton({
  rows = 8,
  className,
}: ActiveVisitsTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {ACTIVE_VISITS_TABLE_SKELETON_COLUMNS.map((column) => (
            <ListPageDataTableHeaderCell key={column.key} className={column.className}>
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <ListPageDataTableRow key={index} className="hover:bg-transparent">
            <ListPageDataTableCell className="py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Skeleton className="size-7.5 shrink-0 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
