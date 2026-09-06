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
  { key: "invoice", label: "Invoice" },
  { key: "payer", label: "Payer" },
  { key: "membership", label: "Membership #", className: "hidden md:table-cell" },
  { key: "status", label: "Status" },
  { key: "payer_status", label: "Payer status", className: "hidden lg:table-cell" },
  { key: "submitted", label: "Submitted", className: "hidden lg:table-cell" },
  { key: "created", label: "Created" },
] as const;

type ClaimsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function ClaimsTableSkeleton({
  rows = 8,
  className,
}: ClaimsTableSkeletonProps) {
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
              <div className="flex min-w-0 items-center gap-2.5">
                <Skeleton className="size-7.5 shrink-0 rounded-lg" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-16" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 md:table-cell">
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-5 w-16 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
