"use client";

import { ArrowDown, ArrowUp, ChevronRight, Lock, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { formatCatalogScheduleSummary } from "@/features/occupational-health/services/oh.service";
import { QuickAddItem } from "@/features/oh-template-builder/components/QuickAddItem";
import { SelectionGlyph } from "@/features/oh-template-builder/components/SelectionGlyph";
import {
  useSectionItems,
  useTemplateBuilder,
} from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { SortableItemList } from "@/features/settings/components/modules/occupational-health/template-library/SortableItemList";
import type {
  BuilderAttachment,
  BuilderItem,
} from "@/features/oh-template-builder/template-builder.types";
import { cn } from "@/lib/utils";

/** Shared by item rows and the canvas column header so the columns line up. */
export const CANVAS_ITEM_GRID =
  "grid grid-cols-[1rem_minmax(0,1fr)_1rem] items-center gap-x-3 sm:grid-cols-[1rem_minmax(0,1fr)_minmax(0,12rem)_6.5rem_1rem]";
/** Horizontal offset of item rows from the section edge (chevron column + guide line). */
export const CANVAS_ITEM_INDENT = "pl-[26px]";

type CanvasSectionProps = {
  attachment: BuilderAttachment;
  isFirst: boolean;
  isLast: boolean;
};

export function CanvasSection({ attachment, isFirst, isLast }: CanvasSectionProps) {
  const { selection, select, moveSection, reorderItems, isBusy } = useTemplateBuilder();
  const [isOpen, setIsOpen] = useState(true);
  const itemsQuery = useSectionItems(attachment.sectionUuid);
  const section = attachment.section;
  const mode = section?.selectionMode ?? "inclusive";
  const name = section?.name ?? "Untitled section";
  const isSectionSelected =
    selection.type === "section" && selection.attachmentUuid === attachment.uuid;
  const selectedItemUuid =
    selection.type === "item" && selection.attachmentUuid === attachment.uuid
      ? selection.itemUuid
      : null;
  const items = itemsQuery.data?.items ?? [];
  const total = itemsQuery.data?.total ?? attachment.itemCount;
  const hiddenCount = Math.max(0, (itemsQuery.data?.total ?? 0) - items.length);
  const bodyId = `canvas-section-body-${attachment.uuid}`;

  return (
    <li
      id={`section-${attachment.uuid}`}
      onClick={(event) => event.stopPropagation()}
      className="group/section scroll-mt-12 py-2.5"
    >
      <div
        className={cn(
          "-mx-1.5 flex h-9 items-center gap-1 rounded-md px-1.5 transition-colors",
          isSectionSelected ? "bg-brand-tint/70" : "hover:bg-slate-50",
        )}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          aria-label={isOpen ? `Collapse ${name}` : `Expand ${name}`}
          onClick={() => setIsOpen((open) => !open)}
          className="flex size-5 shrink-0 items-center justify-center rounded text-dash-muted hover:bg-slate-200/70 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <ChevronRight
            className={cn(
              "size-3.5 transition-transform duration-150 motion-reduce:transition-none",
              isOpen && "rotate-90",
            )}
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={() => select({ type: "section", attachmentUuid: attachment.uuid })}
          aria-pressed={isSectionSelected}
          className="flex min-w-0 flex-1 items-center gap-2 self-stretch rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <span
            className={cn(
              "truncate text-[14px] font-semibold",
              isSectionSelected ? "text-brand-primary" : "text-brand-navy",
            )}
          >
            {name}
          </span>
          {total != null ? (
            <span className="shrink-0 text-[12px] tabular-nums text-dash-muted">{total}</span>
          ) : null}
          <span className="ml-1 hidden shrink-0 items-center gap-1.5 sm:flex">
            {section?.isMandatory ? (
              <span className="rounded bg-brand-tint px-1.5 py-px text-[11px] font-medium text-brand-primary">
                Required
              </span>
            ) : null}
            <span className="rounded border border-dash-border px-1.5 py-px text-[11px] text-brand-slate">
              {mode === "exclusive" ? "One answer" : "Any answers"}
            </span>
            {section?.isSystem ? (
              <Lock className="size-3 text-dash-muted" aria-label="System section" />
            ) : null}
          </span>
        </button>

        <div
          className={cn(
            "flex shrink-0 items-center transition-opacity",
            isSectionSelected
              ? "opacity-100"
              : "opacity-0 focus-within:opacity-100 group-hover/section:opacity-100",
          )}
        >
          <IconButton
            label={`Move ${name} up`}
            disabled={isFirst || isBusy}
            onClick={() => void moveSection(attachment.uuid, "up")}
          >
            <ArrowUp className="size-3.5" aria-hidden />
          </IconButton>
          <IconButton
            label={`Move ${name} down`}
            disabled={isLast || isBusy}
            onClick={() => void moveSection(attachment.uuid, "down")}
          >
            <ArrowDown className="size-3.5" aria-hidden />
          </IconButton>
          <IconButton
            label={`Section settings for ${name}`}
            active={isSectionSelected}
            onClick={() => select({ type: "section", attachmentUuid: attachment.uuid })}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden />
          </IconButton>
        </div>
      </div>

      {isOpen ? (
        <div id={bodyId} className="relative mt-0.5">
          <span
            aria-hidden
            className={cn(
              "absolute bottom-1 left-[9px] top-0 w-px transition-colors",
              isSectionSelected || selectedItemUuid ? "bg-brand-primary/40" : "bg-dash-border",
            )}
          />
          {itemsQuery.isPending ? (
            <ItemsSkeleton />
          ) : itemsQuery.isError ? (
            <p className={cn(CANVAS_ITEM_INDENT, "py-1.5 text-[13px] text-red-600")}>
              Items could not be loaded.
            </p>
          ) : items.length === 0 ? (
            <p className={cn(CANVAS_ITEM_INDENT, "py-1.5 text-[13px] text-dash-muted")}>
              No items yet.
            </p>
          ) : (
            <div className={CANVAS_ITEM_INDENT}>
              <SortableItemList
                items={items}
                disabled={isBusy || section?.contentMode === "direct"}
                onReorder={(orderedUuids) => {
                  void reorderItems(attachment.sectionUuid, orderedUuids);
                }}
                renderItem={(item, handle) => (
                  <CanvasItemRow
                    item={item}
                    mode={mode}
                    dragHandle={handle}
                    isSelected={item.uuid === selectedItemUuid}
                    onSelect={() =>
                      select({
                        type: "item",
                        attachmentUuid: attachment.uuid,
                        itemUuid: item.uuid,
                      })
                    }
                  />
                )}
              />
            </div>
          )}
          {hiddenCount > 0 ? (
            <p className={cn(CANVAS_ITEM_INDENT, "py-1 text-xs text-dash-muted")}>
              {hiddenCount} more item{hiddenCount === 1 ? "" : "s"} not shown.
            </p>
          ) : null}
          {section?.contentMode === "direct" ? null : (
            <div className="pl-[22px]">
              <QuickAddItem
                sectionUuid={attachment.sectionUuid}
                attachmentUuid={attachment.uuid}
              />
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
}

function IconButton({
  label,
  disabled = false,
  active = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:pointer-events-none disabled:opacity-30",
        active
          ? "text-brand-primary hover:bg-white/70"
          : "text-dash-muted hover:bg-slate-200/70 hover:text-brand-navy",
      )}
    >
      {children}
    </button>
  );
}

type CanvasItemRowProps = {
  item: BuilderItem;
  mode: "exclusive" | "inclusive";
  isSelected: boolean;
  onSelect: () => void;
  dragHandle?: ReactNode;
};

function CanvasItemRow({
  item,
  mode,
  isSelected,
  onSelect,
  dragHandle,
}: CanvasItemRowProps) {
  const schedule = formatCatalogScheduleSummary(item.schedule[0]);
  const responses = item.responses.map((response) => response.label).join(", ");
  const responseHint =
    item.effectiveResponseConfig?.response_type ||
    (responses ? responses : "Tick only");

  return (
    <div className="flex items-center gap-1">
      {dragHandle}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={cn(
          CANVAS_ITEM_GRID,
          "group/item h-8 min-w-0 flex-1 rounded-md px-2 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/30",
          isSelected ? "bg-brand-tint" : "hover:bg-slate-50",
        )}
      >
        <SelectionGlyph
          mode={mode}
          className={cn("size-3.5", isSelected && "border-brand-primary")}
        />
        <span
          className={cn(
            "truncate text-[13.5px]",
            isSelected ? "font-medium text-brand-primary" : "text-brand-navy",
          )}
        >
          {item.name}
          {item.isMandatory ? (
            <span className="ml-0.5">
              <RequiredFieldMarker />
            </span>
          ) : null}
        </span>
        <span className="hidden truncate text-[12.5px] text-dash-muted sm:block">
          {responseHint}
        </span>
        <span className="hidden truncate text-[12.5px] text-dash-muted sm:block">
          {schedule ?? <span className="text-slate-300">Once</span>}
        </span>
        <ChevronRight
          className={cn(
            "size-3.5 transition-opacity",
            isSelected
              ? "text-brand-primary opacity-100"
              : "text-dash-muted opacity-0 group-hover/item:opacity-100",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}

function ItemsSkeleton() {
  return (
    <div className={CANVAS_ITEM_INDENT} aria-hidden>
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex h-8 items-center gap-3 px-2">
          <span className="size-3.5 animate-pulse rounded bg-slate-100" />
          <span className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
