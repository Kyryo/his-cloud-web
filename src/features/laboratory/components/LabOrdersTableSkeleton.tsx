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
  { key: "gender", label: "Gender", className: "hidden sm:table-cell" },
  { key: "clinic", label: "Clinic", className: "hidden md:table-cell" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "ordered_by", label: "Ordered by", className: "hidden xl:table-cell" },
  { key: "ordered", label: "Ordered", className: "hidden lg:table-cell" },
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
            <ListPageDataTableHeaderCell
              key={column.key}
              className={"className" in column ? column.className : undefined}
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
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden sm:table-cell">
              <Skeleton className="h-4 w-14" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden xl:table-cell">
              <Skeleton className="h-4 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell">
              <Skeleton className="h-4 w-20" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
