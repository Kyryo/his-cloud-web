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
import { INCOMING_REFERRALS_TABLE_SKELETON_COLUMNS } from "@/features/referrals/components/tables/incoming-referrals-table";

type IncomingReferralsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function IncomingReferralsTableSkeleton({
  rows = 8,
  className,
}: IncomingReferralsTableSkeletonProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {INCOMING_REFERRALS_TABLE_SKELETON_COLUMNS.map((column) => (
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
              <div className="flex min-w-0 items-center gap-2.5">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-24 rounded-md" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right">
              <Skeleton className="ml-auto h-7 w-14 rounded-md" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
