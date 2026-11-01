"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";
import { cn } from "@/lib/utils";

type TemplateOutlineProps = {
  onAddSection: () => void;
};

export function TemplateOutline({ onAddSection }: TemplateOutlineProps) {
  const { attachments, selection, select, isLoading } = useTemplateBuilder();
  const activeAttachmentUuid =
    selection.type === "template" ? null : selection.attachmentUuid;

  return (
    <nav
      aria-label="Template sections"
      className="flex h-full min-h-0 flex-col border-r border-dash-border bg-white"
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-[13px] font-semibold text-brand-navy">Sections</h2>
        <span className="text-xs tabular-nums text-dash-muted">
          {attachments.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <OutlineSkeleton />
        ) : attachments.length === 0 ? (
          <p className="px-2 py-3 text-[13px] leading-5 text-dash-muted">
            No sections yet. Add one to start shaping the form.
          </p>
        ) : (
          <ol className="space-y-0.5">
            {attachments.map((attachment, index) => (
              <OutlineRow
                key={attachment.uuid}
                attachment={attachment}
                index={index}
                isFirst={index === 0}
                isLast={index === attachments.length - 1}
                isActive={attachment.uuid === activeAttachmentUuid}
                onSelect={() =>
                  select({ type: "section", attachmentUuid: attachment.uuid })
                }
              />
            ))}
          </ol>
        )}
      </div>

      <div className="border-t border-dash-border p-2">
        <button
          type="button"
          onClick={onAddSection}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <Plus className="size-4" aria-hidden />
          Add section
        </button>
      </div>
    </nav>
  );
}

type OutlineRowProps = {
  attachment: BuilderAttachment;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  onSelect: () => void;
};

function OutlineRow({
  attachment,
  index,
  isFirst,
  isLast,
  isActive,
  onSelect,
}: OutlineRowProps) {
  const { moveSection, isBusy } = useTemplateBuilder();
  const reduceMotion = useReducedMotion();
  const name = attachment.section?.name ?? "Untitled section";

  return (
    <motion.li
      layout={reduceMotion ? false : "position"}
      transition={{ type: "spring", stiffness: 520, damping: 40 }}
      className="group relative"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg py-2 pl-2 pr-16 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
          isActive ? "bg-brand-tint" : "hover:bg-slate-50",
        )}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] tabular-nums",
            isActive ? "bg-white text-brand-primary" : "bg-slate-100 text-brand-muted",
          )}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-[13px] leading-5",
              isActive ? "font-medium text-brand-navy" : "text-brand-slate",
            )}
          >
            {name}
          </span>
          <span className="block text-[11px] leading-4 text-dash-muted">
            {attachment.itemCount == null
              ? attachment.section?.isMandatory
                ? "Required"
                : "Optional"
              : `${attachment.itemCount} item${attachment.itemCount === 1 ? "" : "s"}`}
          </span>
        </span>
      </button>
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <MoveButton
          label={`Move ${name} up`}
          disabled={isFirst || isBusy}
          onClick={() => void moveSection(attachment.uuid, "up")}
        >
          <ArrowUp className="size-3.5" aria-hidden />
        </MoveButton>
        <MoveButton
          label={`Move ${name} down`}
          disabled={isLast || isBusy}
          onClick={() => void moveSection(attachment.uuid, "down")}
        >
          <ArrowDown className="size-3.5" aria-hidden />
        </MoveButton>
      </div>
    </motion.li>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white hover:text-brand-navy disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function OutlineSkeleton() {
  return (
    <div className="space-y-1 px-2" aria-hidden>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-2.5 py-2">
          <span className="size-6 animate-pulse rounded-md bg-slate-100" />
          <span className="h-3.5 flex-1 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
