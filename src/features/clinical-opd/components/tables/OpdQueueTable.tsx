"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
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
import { OpdQueueStageBadge } from "@/features/clinical-opd/components/OpdQueueStageBadge";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatOpdQueueClientMeta,
  formatWaitingMinutes,
  resolveOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import { ROUTES } from "@/constants/routes";

type OpdQueueTableProps = {
  encounters: OpdQueueEncounter[];
  onRowClick?: (encounter: OpdQueueEncounter) => void;
  encounterHref?: (encounter: OpdQueueEncounter) => string;
  className?: string;
};

function hrefForEncounter(
  encounter: OpdQueueEncounter,
  encounterHref?: (encounter: OpdQueueEncounter) => string,
) {
  return (
    encounterHref?.(encounter) ??
    ROUTES.clinicalOpdEncounter(encounter.visit_uuid, encounter.encounter_uuid)
  );
}

const columns = [
  { key: "client", label: "Client" },
  { key: "wait", label: "Wait" },
  { key: "department", label: "Department" },
  { key: "stage", label: "Stage" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

export function OpdQueueTable({
  encounters,
  onRowClick,
  encounterHref,
  className,
}: OpdQueueTableProps) {
  const router = useRouter();

  const handleOpen = (encounter: OpdQueueEncounter) => {
    if (onRowClick) {
      onRowClick(encounter);
      return;
    }

    router.push(hrefForEncounter(encounter, encounterHref));
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
          const stage = resolveOpdQueueStage(encounter);
          const clientMeta = formatOpdQueueClientMeta(encounter);
          return (
            <ListPageDataTableRow
              key={encounter.encounter_uuid}
              className="group cursor-pointer"
              onClick={() => handleOpen(encounter)}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={encounter.customer_uuid || encounter.customer_name}
                    name={encounter.customer_name}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={hrefForEncounter(encounter, encounterHref)}
                      className="block truncate text-[13px] font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {encounter.customer_name}
                    </Link>
                    {clientMeta ? (
                      <p className="truncate font-mono text-[12px] text-brand-muted">
                        {clientMeta}
                      </p>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>

              <ListPageDataTableCell
                className="font-medium tabular-nums text-brand-navy"
                data-testid="opd-queue-wait"
              >
                {formatWaitingMinutes(encounter.waiting_minutes)}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="text-brand-slate">
                {encounter.department_name || "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell data-testid="opd-queue-stage">
                <OpdQueueStageBadge stage={stage} />
              </ListPageDataTableCell>

              <ListPageDataTableCell data-testid="opd-queue-status">
                <OpdEncounterStatusBadge status={encounter.status} />
              </ListPageDataTableCell>

              <ListPageDataTableCell className="pr-4 text-right">
                <div
                  className="inline-flex items-center justify-end gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                  >
                    <Link href={hrefForEncounter(encounter, encounterHref)}>
                      Open
                    </Link>
                  </Button>
                </div>
              </ListPageDataTableCell>
            </ListPageDataTableRow>
          );
        })}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
