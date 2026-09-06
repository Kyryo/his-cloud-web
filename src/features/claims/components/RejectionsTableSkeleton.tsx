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
  { key: "remittance", label: "Remittance" },
  { key: "treatment_date", label: "Treatment date", className: "hidden md:table-cell" },
  { key: "member", label: "Member #" },
  { key: "patient", label: "Patient" },
  { key: "code", label: "Code", className: "hidden lg:table-cell" },
  { key: "claimed", label: "Claimed", className: "hidden lg:table-cell text-right" },
  { key: "pay_to_you", label: "Pay to you", className: "hidden xl:table-cell text-right" },
  { key: "reason", label: "Reason" },
  { key: "actions", label: "", className: "w-12 text-right" },
] as const;

type RejectionsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function RejectionsTableSkeleton({
  rows = 8,
  className,
}: RejectionsTableSkeletonProps) {
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
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-20" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <Skeleton className="h-3.5 w-14" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 lg:table-cell">
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-16" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden py-3 xl:table-cell">
              <div className="flex justify-end">
                <Skeleton className="h-3.5 w-16" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-16" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="py-3 text-right">
              <div className="flex justify-end">
                <Skeleton className="size-8 rounded-full" />
              </div>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
