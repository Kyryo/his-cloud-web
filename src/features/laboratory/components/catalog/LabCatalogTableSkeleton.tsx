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

type LabCatalogTableSkeletonProps = {
  columns?: number;
  rows?: number;
  className?: string;
};

export function LabCatalogTableSkeleton({
  columns = 5,
  rows = 6,
  className,
}: LabCatalogTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {Array.from({ length: columns }).map((_, index) => (
            <ListPageDataTableHeaderCell key={index}>
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <ListPageDataTableRow key={rowIndex} className="hover:bg-transparent">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <ListPageDataTableCell key={colIndex}>
                <Skeleton className="h-4 w-28" />
              </ListPageDataTableCell>
            ))}
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
