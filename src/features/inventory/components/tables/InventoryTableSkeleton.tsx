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

export type InventoryTableSkeletonColumn = {
  key: string;
  label: string;
  className?: string;
  align?: "left" | "right";
};

type InventoryTableSkeletonProps = {
  columns: readonly InventoryTableSkeletonColumn[];
  rows?: number;
  className?: string;
};

export function InventoryTableSkeleton({
  columns,
  rows = 8,
  className,
}: InventoryTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
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
            {columns.map((column) => (
              <ListPageDataTableCell
                key={column.key}
                className={
                  "align" in column && column.align === "right" ? "pr-4 text-right" : undefined
                }
              >
                {"align" in column && column.align === "right" ? (
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : (
                  <Skeleton className="h-3.5 w-28" />
                )}
              </ListPageDataTableCell>
            ))}
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
