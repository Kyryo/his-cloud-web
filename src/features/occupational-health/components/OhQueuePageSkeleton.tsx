import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
  ListPageHeaderSection,
  ListPageLayout,
  ListPageTableSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";

const columns = [
  { key: "client", label: "Client" },
  { key: "employer", label: "Employer", className: "hidden md:table-cell" },
  { key: "riskProfile", label: "Risk profile", className: "hidden lg:table-cell" },
  { key: "wait", label: "Wait" },
  { key: "department", label: "Department", className: "hidden xl:table-cell" },
  { key: "clinician", label: "Clinician", className: "hidden xl:table-cell" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
] as const;

type OhQueueTableSkeletonProps = {
  rows?: number;
};

export function OhQueueTableSkeleton({ rows = 8 }: OhQueueTableSkeletonProps) {
  return (
    <ListPageDataTable>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          {columns.map((column) => (
            <ListPageDataTableHeaderCell
              key={column.key}
              className={
                column.key === "actions"
                  ? "text-right pr-4"
                  : "className" in column
                    ? column.className
                    : undefined
              }
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
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden md:table-cell">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden lg:table-cell">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-3.5 w-14" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden xl:table-cell">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="hidden xl:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>
            <ListPageDataTableCell>
              <Skeleton className="h-5 w-20 rounded-md" />
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right">
              <Skeleton className="ml-auto h-7 w-16 rounded-md" />
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}

export function OhQueuePageSkeleton() {
  return (
    <ListPageLayout data-testid="oh-queue-page-skeleton">
      <ListPageHeaderSection>
        <ListPageToolbarSkeleton />
      </ListPageHeaderSection>
      <ListPageTableSection>
        <OhQueueTableSkeleton rows={8} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
