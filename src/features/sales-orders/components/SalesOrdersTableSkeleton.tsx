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
  { key: "order", label: "Order Number" },
  { key: "customer", label: "Client" },
  { key: "provider", label: "Care provider", className: "hidden md:table-cell" },
  { key: "pricelist", label: "Pricelist", className: "hidden lg:table-cell" },
  { key: "date", label: "Order Date" },
  { key: "state", label: "State" },
  { key: "total", label: "Total", className: "text-right pr-4" },
] as const;

type SalesOrdersTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function SalesOrdersTableSkeleton({
  rows = 8,
  className,
}: SalesOrdersTableSkeletonProps) {
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
            {/* Order */}
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-24 rounded-md" />
            </ListPageDataTableCell>

            {/* Client */}
            <ListPageDataTableCell>
              <div className="flex min-w-0 items-center gap-2.5">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </ListPageDataTableCell>

            {/* Provider */}
            <ListPageDataTableCell className="hidden md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>

            {/* Pricelist */}
            <ListPageDataTableCell className="hidden lg:table-cell">
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>

            {/* Date */}
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>

            {/* State */}
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-16 rounded-md" />
            </ListPageDataTableCell>

            {/* Total */}
            <ListPageDataTableCell className="pr-4 text-right">
              <div className="flex justify-end">
                <Skeleton className="h-4 w-20" />
              </div>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
