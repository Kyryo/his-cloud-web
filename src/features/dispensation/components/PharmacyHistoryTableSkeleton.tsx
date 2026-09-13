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
import { PHARMACY_HISTORY_TABLE_SKELETON_COLUMNS } from "@/features/dispensation/components/PharmacyHistoryTable";

type PharmacyHistoryTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function PharmacyHistoryTableSkeleton({
  rows = 8,
  className,
}: PharmacyHistoryTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {PHARMACY_HISTORY_TABLE_SKELETON_COLUMNS.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                "align" in column && column.align === "right"
                  ? "text-right pr-4"
                  : "className" in column
                    ? column.className
                    : undefined
              }
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <ListPageDataTableRow key={index} className="hover:bg-transparent">
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-36" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right">
              <div className="flex justify-end">
                <Skeleton className="h-4 w-12" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
