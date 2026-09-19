"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatAllergySeverity,
  formatQueueVitalsSnapshot,
  formatWaitingMinutes,
  groupOpdQueueByStage,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type OpdQueueListProps = {
  encounters: OpdQueueEncounter[];
  onRowClick?: (encounter: OpdQueueEncounter) => void;
  onAddEncounter?: (encounter: OpdQueueEncounter) => void;
  className?: string;
};

const STAGE_ACCENT: Record<string, string> = {
  registered: "bg-amber-500",
  triaged: "bg-brand-primary",
  with_clinician: "bg-emerald-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-400",
};

export function OpdQueueList({
  encounters,
  onRowClick,
  onAddEncounter,
  className,
}: OpdQueueListProps) {
  const router = useRouter();
  const groups = groupOpdQueueByStage(encounters);

  function handleOpen(encounter: OpdQueueEncounter) {
    if (onRowClick) {
      onRowClick(encounter);
      return;
    }

    router.push(
      ROUTES.clinicalOpdEncounter(encounter.visit_uuid, encounter.encounter_uuid),
    );
  }

  return (
    <div className={cn("space-y-6", className)} data-testid="opd-queue-list">
      {groups.map((group) => (
        <section
          key={group.stage}
          aria-labelledby={`opd-queue-group-${group.stage}`}
          data-testid={`opd-queue-group-${group.stage}`}
        >
          <header className="flex items-center justify-between gap-3 px-1 pb-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  STAGE_ACCENT[group.stage] ?? "bg-slate-400",
                )}
              />
              <h2
                id={`opd-queue-group-${group.stage}`}
                className="truncate text-[13px] font-semibold text-brand-navy"
              >
                {group.label}
              </h2>
            </div>
            <span className="rounded-full bg-dash-canvas px-2 py-0.5 text-[11px] tabular-nums text-dash-muted">
              {group.encounters.length}
            </span>
          </header>

          {group.encounters.length === 0 ? (
            <p className="rounded-lg border border-dashed border-dash-border px-4 py-6 text-center text-sm text-dash-muted">
              No encounters
            </p>
          ) : (
            <ul className="divide-y divide-dash-border/70 border-y border-dash-border/70">
              {group.encounters.map((encounter) => (
                <OpdQueueListRow
                  key={encounter.encounter_uuid}
                  encounter={encounter}
                  onOpen={handleOpen}
                  onAddEncounter={onAddEncounter}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function OpdQueueListRow({
  encounter,
  onOpen,
  onAddEncounter,
}: {
  encounter: OpdQueueEncounter;
  onOpen: (encounter: OpdQueueEncounter) => void;
  onAddEncounter?: (encounter: OpdQueueEncounter) => void;
}) {
  const canAddEncounter = encounter.visit_status === "active";
  const encounterHref = ROUTES.clinicalOpdEncounter(
    encounter.visit_uuid,
    encounter.encounter_uuid,
  );

  return (
    <li>
      <div
        className="group flex cursor-pointer items-center gap-3 px-1 py-2.5 hover:bg-dash-canvas/70"
        onClick={() => onOpen(encounter)}
        data-testid="opd-queue-list-row"
      >
        <UserIdenticon
          seed={encounter.customer_uuid || encounter.customer_name}
          name={encounter.customer_name}
          className="size-8 shrink-0 rounded-md"
        />

        <div className="min-w-0 flex-1">
          <Link
            href={encounterHref}
            className="block truncate text-sm font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
            onClick={(event) => event.stopPropagation()}
          >
            {encounter.customer_name}
          </Link>
          <p className="truncate text-[12px] text-brand-muted">
            {encounter.customer_identifier
              ? `${encounter.customer_identifier} · `
              : ""}
            {encounter.department_name || "—"}
            {" · "}
            {formatQueueVitalsSnapshot(encounter.latest_vitals)}
            {" · "}
            {formatAllergySeverity(
              encounter.highest_allergy_severity,
              encounter.allergy_count,
            )}
          </p>
        </div>

        <span className="shrink-0 text-sm font-medium tabular-nums text-brand-navy">
          {formatWaitingMinutes(encounter.waiting_minutes)}
        </span>

        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          {onAddEncounter ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas sm:inline-flex"
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
            <Link href={encounterHref}>Open</Link>
          </Button>
        </div>
      </div>
    </li>
  );
}
