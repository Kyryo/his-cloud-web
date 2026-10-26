"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";

import { OpdQueueBoardCardFace } from "@/features/clinical-opd/components/OpdQueueBoardCard";
import { OpdQueueBoardColumn } from "@/features/clinical-opd/components/OpdQueueBoardColumn";
import { OpdQueueBoardMoveDialog } from "@/features/clinical-opd/components/OpdQueueBoardMoveDialog";
import { OpdQueueBoardSheet } from "@/features/clinical-opd/components/OpdQueueBoardSheet";
import { useOpdQueueBoardMove } from "@/features/clinical-opd/hooks/use-opd-queue-board-move";
import type {
  OpdQueueEncounter,
  OpdQueueStage,
} from "@/features/clinical-opd/types/clinical-opd.types";
import {
  OPD_BOARD_STAGES,
  groupOpdQueueForBoard,
} from "@/features/clinical-opd/utils/opd-queue-board";
import { resolveOpdQueueStage } from "@/features/clinical-opd/utils/opd-queue-stage";
import { ROUTES } from "@/constants/routes";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdQueueBoardProps = {
  encounters: OpdQueueEncounter[];
  encounterHref?: (encounter: OpdQueueEncounter) => string;
};

function isBoardStage(value: string): value is OpdQueueStage {
  return (OPD_BOARD_STAGES as readonly string[]).includes(value);
}

export function OpdQueueBoard({
  encounters,
  encounterHref,
}: OpdQueueBoardProps) {
  const { rows, movingId, pending, isConfirming, requestMove, dismissPending, confirmPending } =
    useOpdQueueBoardMove(encounters);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const columns = groupOpdQueueForBoard(rows);
  const dragging =
    rows.find((item) => item.encounter_uuid === draggingId) ?? null;
  const selected =
    rows.find((item) => item.encounter_uuid === selectedId) ?? null;

  function openEncounter(encounter: OpdQueueEncounter) {
    setSelectedId(encounter.encounter_uuid);
  }

  function hrefFor(encounter: OpdQueueEncounter) {
    return (
      encounterHref?.(encounter) ??
      ROUTES.clinicalOpdEncounter(encounter.visit_uuid, encounter.encounter_uuid)
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const overId = event.over?.id ? String(event.over.id) : null;
    const encounter = rows.find(
      (item) => item.encounter_uuid === String(event.active.id),
    );
    if (!encounter || !overId || !isBoardStage(overId)) {
      return;
    }
    requestMove(encounter, overId);
  }

  return (
    <div
      className="flex h-[calc(100dvh-12.5rem)] min-h-80 flex-col"
      data-testid="opd-queue-board"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        <div className="flex h-full min-h-0 flex-1 gap-3 overflow-x-auto pb-1">
          {columns.map((column) => (
            <OpdQueueBoardColumn
              key={column.stage}
              column={column}
              draggingStage={
                dragging ? resolveOpdQueueStage(dragging) : null
              }
              movingId={movingId}
              onOpen={openEncounter}
            />
          ))}
        </div>
        <DragOverlay>
          {dragging ? (
            <div className={cn(appFont.className, "w-[17.5rem]")}>
              <OpdQueueBoardCardFace
                encounter={dragging}
                className="scale-[1.03] shadow-lg ring-black/10"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <OpdQueueBoardMoveDialog
        pending={pending}
        isConfirming={isConfirming}
        onDismiss={dismissPending}
        onConfirm={(note) => {
          void confirmPending(note);
        }}
      />
      <OpdQueueBoardSheet
        encounter={selected}
        href={selected ? hrefFor(selected) : null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />
    </div>
  );
}
