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

type PricelistProductsTableSkeletonProps = {
  rows?: number;
  showActions?: boolean;
  className?: string;
};

export function PricelistProductsTableSkeleton({
  rows = 8,
  showActions = true,
  className,
}: PricelistProductsTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Product</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Tariff code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="text-right">
            Min qty
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="text-right pr-4">
            Fixed price
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Valid from</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Valid to</ListPageDataTableHeaderCell>
          {showActions ? (
            <ListPageDataTableHeaderCell className="text-right pr-4">
              Actions
            </ListPageDataTableHeaderCell>
          ) : null}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <ListPageDataTableRow key={index} className="hover:bg-transparent">
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-40" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-16" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-right">
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-10" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right">
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-16" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            {showActions ? (
              <ListPageDataTableCell className="pr-4 text-right">
                <div className="flex justify-end gap-1.5">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </ListPageDataTableCell>
            ) : null}
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
