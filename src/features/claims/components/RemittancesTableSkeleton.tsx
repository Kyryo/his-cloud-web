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
  { key: "file", label: "File" },
  { key: "payer", label: "Payer" },
  { key: "status", label: "Status" },
  { key: "document", label: "Document", className: "hidden md:table-cell" },
  { key: "rows", label: "Rows", className: "hidden lg:table-cell" },
  { key: "matched", label: "Matched", className: "hidden lg:table-cell" },
  { key: "uploaded", label: "Uploaded" },
] as const;

type RemittancesTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function RemittancesTableSkeleton({
  rows = 8,
  className,
}: RemittancesTableSkeletonProps) {
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
            <ListPageDataTableCell className="py-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-16" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <Skeleton className="h-3.5 w-10" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <Skeleton className="h-3.5 w-10" />
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
