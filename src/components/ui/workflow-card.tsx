"use client";

import { AlertCircle, Check, ChevronDown, Circle, X } from "lucide-react";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type WorkflowStageStatus =
  | "completed"
  | "current"
  | "pending"
  | "blocked"
  | "failed";

export type WorkflowStageConfig = {
  id: string;
  title: string;
  /** One-line status shown in the collapsed header. */
  summary: string;
  status: WorkflowStageStatus;
  content?: ReactNode;
  /** Force open/closed; when omitted, defaults from status. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When uncontrolled, seed open state (overrides status default). */
  defaultOpen?: boolean;
  /** Disable expand when true (e.g. pending locked stages). */
  disabled?: boolean;
};

export type WorkflowCardProps = {
  title?: string;
  description?: string;
  stages: WorkflowStageConfig[];
  headerActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

const STATUS_LABEL: Record<WorkflowStageStatus, string> = {
  completed: "Completed",
  current: "In progress",
  pending: "Pending",
  blocked: "Blocked",
  failed: "Failed",
};

function StageStatusIcon({ status }: { status: WorkflowStageStatus }) {
  if (status === "completed") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
        <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="relative flex size-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm shadow-brand-primary/25">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-primary/30 [animation-duration:2.4s]" />
        <Circle className="relative size-2.5 fill-current" aria-hidden="true" />
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm shadow-red-600/20">
        <AlertCircle className="size-4" aria-hidden="true" />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm shadow-red-600/20">
        <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full border border-brand-border bg-white text-brand-muted">
      <Circle className="size-2.5" aria-hidden="true" />
    </span>
  );
}

function StageStatusChip({ status }: { status: WorkflowStageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        status === "completed" && "bg-emerald-50 text-emerald-800",
        status === "current" && "bg-brand-tint text-brand-primary",
        status === "pending" && "bg-slate-100 text-brand-muted",
        status === "blocked" && "bg-red-50 text-red-700",
        status === "failed" && "bg-red-50 text-red-700",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function defaultOpenForStatus(status: WorkflowStageStatus): boolean {
  return status === "current" || status === "blocked" || status === "failed";
}

function WorkflowStageRow({
  stage,
  isLast,
}: {
  stage: WorkflowStageConfig;
  isLast: boolean;
}) {
  const controlled = stage.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(() =>
    stage.defaultOpen !== undefined
      ? stage.defaultOpen
      : defaultOpenForStatus(stage.status),
  );
  const open = controlled ? Boolean(stage.open) : uncontrolledOpen;

  useEffect(() => {
    if (controlled) {
      return;
    }
    setUncontrolledOpen(
      stage.defaultOpen !== undefined
        ? stage.defaultOpen
        : defaultOpenForStatus(stage.status),
    );
  }, [controlled, stage.defaultOpen, stage.status]);

  function handleOpenChange(next: boolean) {
    if (stage.disabled && next) {
      return;
    }
    if (!controlled) {
      setUncontrolledOpen(next);
    }
    stage.onOpenChange?.(next);
  }

  const canExpand = Boolean(stage.content) && !stage.disabled;

  return (
    <li className="relative flex gap-4" data-testid={`workflow-stage-${stage.id}`}>
      <div className="flex w-8 shrink-0 flex-col items-center">
        <StageStatusIcon status={stage.status} />
        {!isLast ? (
          <div
            className={cn(
              "mt-2 w-px flex-1",
              stage.status === "completed"
                ? "bg-emerald-200"
                : "bg-brand-border",
            )}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <Collapsible open={open} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger
            disabled={!canExpand}
            className={cn(
              "group flex w-full items-start justify-between gap-3 rounded-xl text-left transition-colors",
              canExpand && "hover:bg-slate-50/80",
              "px-3 py-2.5 -mx-1",
              !canExpand && "cursor-default",
            )}
            aria-label={`${stage.title}: ${STATUS_LABEL[stage.status]}`}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-brand-navy">
                  {stage.title}
                </h3>
                <StageStatusChip status={stage.status} />
              </div>
              <p className="text-sm leading-snug text-brand-muted">
                {stage.summary}
              </p>
            </div>
            {canExpand ? (
              <ChevronDown
                className={cn(
                  "mt-1 size-4 shrink-0 text-brand-muted transition-transform duration-200",
                  open && "rotate-180",
                )}
                aria-hidden="true"
              />
            ) : null}
          </CollapsibleTrigger>

          {stage.content ? (
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="px-2 pb-1 pt-3">{stage.content}</div>
            </CollapsibleContent>
          ) : null}
        </Collapsible>
      </div>
    </li>
  );
}

/**
 * Reusable multi-stage workflow card for progressive SaaS flows.
 * Always shows every stage with a clear status; expands the active ones.
 */
export function WorkflowCard({
  title,
  description,
  stages,
  headerActions,
  footer,
  className,
  "data-testid": dataTestId = "workflow-card",
}: WorkflowCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
      data-testid={dataTestId}
    >
      {title || description || headerActions ? (
        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-brand-muted">
                {description}
              </p>
            ) : null}
          </div>
          {headerActions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {headerActions}
            </div>
          ) : null}
        </div>
      ) : null}

      <ol className="px-5 py-5 sm:px-6">{stages.map((stage, index) => (
        <WorkflowStageRow
          key={stage.id}
          stage={stage}
          isLast={index === stages.length - 1}
        />
      ))}</ol>

      {footer ? (
        <div className="border-t border-brand-border px-5 py-4 sm:px-6">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
