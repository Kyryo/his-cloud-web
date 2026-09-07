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
  { key: "patient", label: "Client" },
  { key: "clinic", label: "Clinic" },
  { key: "department", label: "Department" },
  { key: "clinician", label: "Care provider", className: "hidden md:table-cell" },
  { key: "scheduled_start", label: "Scheduled" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

type AppointmentsTableSkeletonProps = {
  rows?: number;
  className?: string;
};

export function AppointmentsTableSkeleton({
  rows = 8,
  className,
}: AppointmentsTableSkeletonProps) {
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
            {/* Client */}
            <ListPageDataTableCell className="py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-8.5 shrink-0 rounded-lg" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </ListPageDataTableCell>

            {/* Clinic */}
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>

            {/* Department */}
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-28" />
            </ListPageDataTableCell>

            {/* Clinician */}
            <ListPageDataTableCell className="hidden py-3 md:table-cell">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>

            {/* Scheduled */}
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-3.5 w-24" />
            </ListPageDataTableCell>

            {/* Status */}
            <ListPageDataTableCell className="py-3">
              <Skeleton className="h-5 w-20 rounded-full" />
            </ListPageDataTableCell>

            {/* Actions */}
            <ListPageDataTableCell className="py-3 pr-4 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-7 w-20 rounded-md" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </ListPageDataTableCell>
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
