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
  { key: "client", label: "Client" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "started", label: "Started" },
  { key: "actions", label: "Actions" },
] as const;

type OpdQueueTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function OpdQueueTableSkeleton({
  rows = 8,
  className,
}: OpdQueueTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={column.key === "actions" ? "text-right pr-4" : undefined}
            >
              {column.label}
            </ListPageDataTableHeaderCell>
          ))}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <ListPageDataTableRow key={index} className="hover:bg-transparent">
            <ListPageDataTableCell className="py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-8.5 shrink-0 rounded-lg" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 pr-4 text-right">
              <Skeleton className="ml-auto h-7 w-16 rounded-lg" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
