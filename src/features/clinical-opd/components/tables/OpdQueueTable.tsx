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
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatAllergySeverity,
  formatOpdQueueStage,
  formatQueueVitalsSnapshot,
  formatWaitingMinutes,
  resolveOpdQueueStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import { ROUTES } from "@/constants/routes";

type OpdQueueTableProps = {
  encounters: OpdQueueEncounter[];
  onRowClick?: (encounter: OpdQueueEncounter) => void;
  onAddEncounter?: (encounter: OpdQueueEncounter) => void;
  className?: string;
};

const columns = [
  { key: "client", label: "Client" },
  { key: "wait", label: "Wait" },
  { key: "vitals", label: "Vitals" },
  { key: "allergies", label: "Allergies" },
  { key: "department", label: "Department" },
  { key: "stage", label: "Stage" },
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
          const stage = resolveOpdQueueStage(encounter);
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
                  <div className="min-w-0">
                    <Link
                      href={ROUTES.clinicalOpdEncounter(
                        encounter.visit_uuid,
                        encounter.encounter_uuid,
                      )}
                      className="block truncate font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
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

              <ListPageDataTableCell
                className="font-medium tabular-nums text-brand-navy"
                data-testid="opd-queue-wait"
              >
                {formatWaitingMinutes(encounter.waiting_minutes)}
              </ListPageDataTableCell>

              <ListPageDataTableCell
                className="text-brand-slate"
                data-testid="opd-queue-vitals"
              >
                {formatQueueVitalsSnapshot(encounter.latest_vitals)}
              </ListPageDataTableCell>

              <ListPageDataTableCell data-testid="opd-queue-allergies">
                {formatAllergySeverity(
                  encounter.highest_allergy_severity,
                  encounter.allergy_count,
                )}
              </ListPageDataTableCell>

              <ListPageDataTableCell className="text-brand-slate">
                {encounter.department_name || "—"}
              </ListPageDataTableCell>

              <ListPageDataTableCell>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium text-brand-navy">
                    {formatOpdQueueStage(stage)}
                  </span>
                  <OpdEncounterStatusBadge status={encounter.status} />
                </div>
              </ListPageDataTableCell>

              <ListPageDataTableCell className="pr-4 text-right">
                <div
                  className="inline-flex items-center justify-end gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  {onAddEncounter ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                      disabled={!canAddEncounter}
                      onClick={() => onAddEncounter(encounter)}
                      data-testid="opd-queue-add-encounter"
                    >
                      Add encounter
                    </Button>
                  ) : null}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                  >
                    <Link
                      href={ROUTES.clinicalOpdEncounter(
                        encounter.visit_uuid,
                        encounter.encounter_uuid,
                      )}
                    >
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
