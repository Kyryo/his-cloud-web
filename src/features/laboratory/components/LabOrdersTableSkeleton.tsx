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

const columns = [
  { key: "patient", label: "Patient" },
  { key: "clinic", label: "Clinic" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "items", label: "Items" },
  { key: "ordered_by", label: "Ordered by" },
  { key: "ordered", label: "Ordered" },
] as const;

type LabOrdersTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function LabOrdersTableSkeleton({
  rows = 8,
  className,
}: LabOrdersTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
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
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-4 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-4 w-32" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-4 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-4 w-28" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
