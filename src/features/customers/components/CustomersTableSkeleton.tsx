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
  { key: "id", label: "Client ID" },
  { key: "visit_status", label: "Visit status" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "created", label: "Created" },
] as const;

type CustomersTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function CustomersTableSkeleton({
  rows = 8,
  className,
}: CustomersTableSkeletonProps) {
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
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-24 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-14" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-8" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
