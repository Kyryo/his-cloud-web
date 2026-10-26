"use client";

import { useDroppable } from "@dnd-kit/core";

import { OpdQueueBoardCard } from "@/features/clinical-opd/components/OpdQueueBoardCard";
import type { OpdQueueEncounter, OpdQueueStage } from "@/features/clinical-opd/types/clinical-opd.types";
import type { OpdBoardColumn } from "@/features/clinical-opd/utils/opd-queue-board";
import {
  canDropOnOpdBoardColumn,
  isEarlierOpdBoardStage,
} from "@/features/clinical-opd/utils/opd-queue-board";
import { cn } from "@/lib/utils";

const STAGE_ACCENT: Record<OpdQueueStage, string> = {
  registered: "bg-amber-500",
  triaged: "bg-brand-primary",
  with_clinician: "bg-emerald-500",
  completed: "bg-slate-400",
  cancelled: "bg-red-400",
};

type OpdQueueBoardColumnProps = {
  column: OpdBoardColumn;
  draggingStage: OpdQueueStage | null;
  movingId: string | null;
  onOpen: (encounter: OpdQueueEncounter) => void;
};

export function OpdQueueBoardColumn({
  column,
  draggingStage,
  movingId,
  onOpen,
}: OpdQueueBoardColumnProps) {
  const isEarlier = Boolean(
    draggingStage && isEarlierOpdBoardStage(draggingStage, column.stage),
  );
  const isValidTarget =
    !draggingStage || canDropOnOpdBoardColumn(draggingStage, column.stage);
  const { setNodeRef, isOver } = useDroppable({
    id: column.stage,
    disabled: !isValidTarget,
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[18.5rem] shrink-0 flex-col rounded-2xl bg-dash-canvas/90 p-2.5",
        isEarlier && "pointer-events-none opacity-40 grayscale",
        draggingStage && !isValidTarget && !isEarlier && "opacity-40",
        isOver && isValidTarget && "ring-2 ring-brand-primary/25",
      )}
      data-muted={isEarlier ? "earlier" : undefined}
      data-testid={`opd-queue-board-column-${column.stage}`}
    >
      <header className="flex items-center justify-between gap-3 px-1.5 pb-2.5 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 shrink-0 rounded-full", STAGE_ACCENT[column.stage])}
          />
          <h3 className="truncate text-[13px] font-semibold text-brand-navy">
            {column.label}
          </h3>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tabular-nums text-dash-muted ring-1 ring-black/5">
          {column.encounters.length}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {column.encounters.length === 0 ? (
          <p className="rounded-xl border border-dashed border-dash-border/90 px-3 py-8 text-center text-xs text-dash-muted">
            {isEarlier
              ? "Can't move back"
              : isValidTarget && draggingStage
                ? "Drop to update"
                : "No encounters"}
          </p>
        ) : (
          column.encounters.map((encounter) => (
            <OpdQueueBoardCard
              key={encounter.encounter_uuid}
              encounter={encounter}
              isMoving={movingId === encounter.encounter_uuid}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </section>
  );
}
