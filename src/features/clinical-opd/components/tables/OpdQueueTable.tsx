"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { UserIdenticon } from "@/components/UserIdenticon";
import { SecondaryButton } from "@/components/ui/app-buttons";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import { ROUTES } from "@/constants/routes";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

type OpdQueueTableProps = {
  encounters: OpdQueueEncounter[];
  onRowClick?: (encounter: OpdQueueEncounter) => void;
  onAddEncounter?: (encounter: OpdQueueEncounter) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "started", label: "Started" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

export function OpdQueueTable({
  encounters,
  onRowClick,
  onAddEncounter,
  className,
}: OpdQueueTableProps) {
  const router = useRouter();

  const handleOpen = (encounter: OpdQueueEncounter) => {
    if (onRowClick) {
      onRowClick(encounter);
      return;
    }

    router.push(
      ROUTES.clinicalOpdEncounter(encounter.visit_uuid, encounter.encounter_uuid),
    );
  };

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
        {encounters.map((encounter) => {
          const canAddEncounter = encounter.visit_status === "active";
          return (
            <ListPageDataTableRow
              key={encounter.encounter_uuid}
              className="group cursor-pointer transition-colors hover:bg-slate-50/70"
              onClick={() => handleOpen(encounter)}
            >
              <ListPageDataTableCell className="py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserIdenticon
                    seed={encounter.customer_uuid || encounter.customer_name}
                    name={encounter.customer_name}
                    className="size-8.5 shrink-0 rounded-lg shadow-2xs"
                  />
                  <div className="min-w-0">
                    <Link
                      href={ROUTES.clinicalOpdEncounter(
                        encounter.visit_uuid,
                        encounter.encounter_uuid,
                      )}
                      className="block truncate text-sm font-semibold text-brand-navy transition-colors group-hover:text-brand-primary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {encounter.customer_name}
                    </Link>
                    {encounter.customer_identifier ? (
                      <p className="truncate font-mono text-[11px] text-brand-muted">
                        {encounter.customer_identifier}
                      </p>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>

              <ListPageDataTableCell className="py-3 text-sm text-brand-slate">
                {encounter.department_name || "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="py-3">
                <OpdEncounterStatusBadge status={encounter.status} />
              </ListPageDataTableCell>

              <ListPageDataTableCell className="py-3 text-sm font-medium text-brand-navy tabular-nums">
                {encounter.started_at
                  ? formatDisplayDateTime(encounter.started_at)
                  : "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="py-3 pr-4 text-right">
                <div
                  className="inline-flex items-center justify-end gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  {onAddEncounter ? (
                    <SecondaryButton
                      type="button"
                      size="sm"
                      className="h-7 text-sm"
                      disabled={!canAddEncounter}
                      onClick={() => onAddEncounter(encounter)}
                      data-testid="opd-queue-add-encounter"
                    >
                      Add encounter
                    </SecondaryButton>
                  ) : null}
                  <SecondaryButton asChild size="sm" className="h-7 text-sm">
                    <Link
                      href={ROUTES.clinicalOpdEncounter(
                        encounter.visit_uuid,
                        encounter.encounter_uuid,
                      )}
                    >
                      Open
                    </Link>
                  </SecondaryButton>
                </div>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
