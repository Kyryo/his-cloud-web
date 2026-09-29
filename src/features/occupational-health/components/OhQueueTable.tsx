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
import type { OhVisitEncounter } from "@/features/occupational-health/types";
import { formatWaitingMinutes } from "@/features/clinical-opd/utils/opd-queue-stage";
import { ROUTES } from "@/constants/routes";

type OhQueueTableProps = {
  encounters: OhVisitEncounter[];
  className?: string;
};

function waitingMinutesFor(encounter: OhVisitEncounter): number | null {
  const started = encounter.started_at || encounter.created_at;
  if (!started) {
    return null;
  }
  const ms = Date.now() - new Date(started).getTime();
  if (Number.isNaN(ms) || ms < 0) {
    return null;
  }
  return Math.floor(ms / 60_000);
}

const columns = [
  { key: "client", label: "Client" },
  { key: "wait", label: "Wait" },
  { key: "department", label: "Department" },
  { key: "clinician", label: "Clinician" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "text-right pr-4" },
] as const;

export function OhQueueTable({
  encounters,
  className,
}: OhQueueTableProps) {
  const router = useRouter();

  return (
    <ListPageDataTable className={className} data-testid="oh-queue-table">
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
          const href = ROUTES.occupationalHealthEncounter(
            encounter.visit,
            encounter.uuid,
          );
          const clientLabel =
            encounter.customer_name?.trim() ||
            encounter.customer_identifier?.trim() ||
            "Unknown client";
          const waiting = waitingMinutesFor(encounter);

          return (
            <ListPageDataTableRow
              key={encounter.uuid}
              className="group cursor-pointer"
              onClick={() => router.push(href)}
            >
              <ListPageDataTableCell>
                <div className="flex min-w-0 items-center gap-2.5">
                  <UserIdenticon
                    seed={encounter.customer_uuid || clientLabel}
                    name={clientLabel}
                    className="size-8 shrink-0 rounded-md"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={href}
                      className="block truncate text-[13px] font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {clientLabel}
                    </Link>
                    {encounter.location_name ? (
                      <p className="truncate text-[12px] text-brand-muted">
                        {encounter.location_name}
                      </p>
                    ) : null}
                  </div>
                </div>
              </ListPageDataTableCell>

              <ListPageDataTableCell className="font-medium tabular-nums text-brand-navy">
                {formatWaitingMinutes(waiting)}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="text-brand-slate">
                {encounter.department_name || "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="text-brand-slate">
                {encounter.clinician_name ?? "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell>
                <OpdEncounterStatusBadge status={encounter.status} />
              </ListPageDataTableCell>

              <ListPageDataTableCell className="pr-4 text-right">
                <div
                  className="inline-flex items-center justify-end"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                  >
                    <Link href={href}>Open</Link>
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
