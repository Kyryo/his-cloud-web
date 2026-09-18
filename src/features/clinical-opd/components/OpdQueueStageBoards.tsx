"use client";

import {
  OPD_QUEUE_STAGE_OPTIONS,
  type OpdQueueListFilterState,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { cn } from "@/lib/utils";

type OpdQueueStageBoardsProps = {
  filters: OpdQueueListFilterState;
  isLoading?: boolean;
  onChange: (filters: OpdQueueListFilterState) => void;
};

export function OpdQueueStageBoards({
  filters,
  isLoading = false,
  onChange,
}: OpdQueueStageBoardsProps) {
  const liveBoards = OPD_QUEUE_STAGE_OPTIONS.filter(
    (option) => option.group === "live",
  );
  const closedBoards = OPD_QUEUE_STAGE_OPTIONS.filter(
    (option) => option.group === "closed",
  );

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      data-testid="opd-queue-stage-boards"
    >
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Live queue boards"
      >
        {liveBoards.map((board) => {
          const isActive = filters.queueStage === board.value;
          return (
            <button
              key={board.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isLoading}
              onClick={() => onChange({ queueStage: board.value })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                isActive
                  ? "bg-brand-tint text-brand-primary"
                  : "text-brand-muted hover:bg-dash-canvas hover:text-brand-navy",
              )}
              data-testid={`opd-queue-board-${board.value}`}
            >
              {board.label}
            </button>
          );
        })}
      </div>
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Closed queue boards"
      >
        {closedBoards.map((board) => {
          const isActive = filters.queueStage === board.value;
          return (
            <button
              key={board.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isLoading}
              onClick={() => onChange({ queueStage: board.value })}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                isActive
                  ? "bg-slate-100 font-medium text-brand-navy"
                  : "text-dash-muted hover:bg-dash-canvas hover:text-brand-navy",
              )}
              data-testid={`opd-queue-board-${board.value}`}
            >
              {board.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
