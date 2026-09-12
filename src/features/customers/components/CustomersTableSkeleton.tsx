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
  { key: "id", label: "Client ID / MRN" },
  { key: "visit_status", label: "Visit Status" },
  { key: "demographics", label: "Demographics" },
  { key: "created", label: "Registered" },
  { key: "actions", label: "Actions" },
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
            {/* Client */}
            <ListPageDataTableCell>
              <div className="flex min-w-0 items-center gap-2.5">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </ListPageDataTableCell>

            {/* MRN */}
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-20 rounded-md" />
            </ListPageDataTableCell>

            {/* Status */}
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-20 rounded-md" />
            </ListPageDataTableCell>

            {/* Demographics */}
            <ListPageDataTableCell>
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-14" />
                <Skeleton className="h-3 w-10" />
              </div>
            </ListPageDataTableCell>

            {/* Created */}
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>

            {/* Actions */}
            <ListPageDataTableCell className="pr-4 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
