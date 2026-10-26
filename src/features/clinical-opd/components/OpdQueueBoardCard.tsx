"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { UserIdenticon } from "@/components/UserIdenticon";
import type { OpdQueueEncounter } from "@/features/clinical-opd/types/clinical-opd.types";
import {
  formatOpdQueueClientMeta,
  formatWaitingMinutes,
} from "@/features/clinical-opd/utils/opd-queue-stage";
import { cn } from "@/lib/utils";

type OpdQueueBoardCardFaceProps = {
  encounter: OpdQueueEncounter;
  className?: string;
  isMoving?: boolean;
  onOpen?: (encounter: OpdQueueEncounter) => void;
  dragHandleProps?: Record<string, unknown>;
};

export function OpdQueueBoardCardFace({
  encounter,
  className,
  isMoving = false,
  onOpen,
  dragHandleProps,
}: OpdQueueBoardCardFaceProps) {
  const meta = formatOpdQueueClientMeta(encounter);

  return (
    <button
      type="button"
      data-testid={`opd-queue-board-card-${encounter.encounter_uuid}`}
      className={cn(
        "w-full cursor-grab rounded-xl bg-white p-3 text-left shadow-[0_1px_2px_rgba(31,42,36,0.06)] ring-1 ring-black/5 transition-shadow active:cursor-grabbing",
        isMoving && "opacity-70",
        className,
      )}
      onClick={() => onOpen?.(encounter)}
      {...dragHandleProps}
    >
      <span className="flex items-start gap-2.5">
        <UserIdenticon
          seed={encounter.customer_uuid || encounter.customer_name}
          name={encounter.customer_name}
          className="size-8 shrink-0 rounded-full"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-brand-navy">
            {encounter.customer_name}
          </span>
          {meta ? (
            <span className="mt-0.5 block truncate text-[11px] text-dash-muted">
              {meta}
            </span>
          ) : null}
          <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-dash-muted">
            <span className="truncate">{encounter.department_name || "OPD"}</span>
            <span className="shrink-0 tabular-nums">
              {formatWaitingMinutes(encounter.waiting_minutes)}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

type OpdQueueBoardCardProps = {
  encounter: OpdQueueEncounter;
  isMoving?: boolean;
  onOpen: (encounter: OpdQueueEncounter) => void;
};

export function OpdQueueBoardCard({
  encounter,
  isMoving = false,
  onOpen,
}: OpdQueueBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: encounter.encounter_uuid,
    data: { encounter },
    disabled: isMoving,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-30")}
    >
      <OpdQueueBoardCardFace
        encounter={encounter}
        isMoving={isMoving}
        onOpen={isDragging ? undefined : onOpen}
        dragHandleProps={{ ...listeners, ...attributes }}
        className="hover:ring-brand-primary/20"
      />
    </div>
  );
}
