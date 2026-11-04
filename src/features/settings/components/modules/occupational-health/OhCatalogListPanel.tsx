"use client";

import type { ReactNode } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { cn } from "@/lib/utils";

type OhCatalogListPanelProps = {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  isLoading?: boolean;
  error?: string | null;
  emptyTitle: string;
  emptyDescription: string;
  toolbar?: ReactNode;
  children: ReactNode;
  isEmpty: boolean;
  /** Compact chrome for sheets / nested workspaces. */
  embedded?: boolean;
};

export function OhCatalogListPanel({
  title,
  description,
  addLabel,
  onAdd,
  isLoading = false,
  error = null,
  emptyTitle,
  emptyDescription,
  toolbar,
  children,
  isEmpty,
  embedded = false,
}: OhCatalogListPanelProps) {
  const body = (
    <>
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      {isLoading ? (
        <SettingsContentSkeleton rows={4} showHeader={false} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : isEmpty ? (
        <div
          className={cn(
            "rounded-xl border border-dashed border-dash-border/80 bg-slate-50/60 px-4 py-8 text-center",
            embedded && "rounded-none border-0 border-b border-solid bg-transparent px-0 py-12",
          )}
        >
          <p className={cn("text-sm font-medium text-brand-navy", embedded && "text-[15px]")}>
            {emptyTitle}
          </p>
          <p className={cn("mt-1 text-sm text-slate-400", embedded && "text-[13px] text-dash-muted")}>
            {emptyDescription}
          </p>
        </div>
      ) : (
        children
      )}
    </>
  );

  if (embedded) {
    return (
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="min-w-0 text-[13px] text-dash-muted">{description}</p>
          <PrimaryButton
            type="button"
            size="sm"
            className="h-8 shrink-0 px-3 text-[13px]"
            onClick={onAdd}
          >
            {addLabel}
          </PrimaryButton>
        </div>
        {body}
      </div>
    );
  }

  return (
    <SettingsPanelSection
      title={title}
      description={description}
      action={
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          {addLabel}
        </Button>
      }
    >
      {body}
    </SettingsPanelSection>
  );
}

type OhCatalogRowProps = {
  title: string;
  meta?: string;
  color?: string | null;
  isActive?: boolean;
  archiving?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  /** Whole-row click (e.g. open employer workspace). Hides edit/archive. */
  onSelect?: () => void;
};

function CatalogColorSwatch({ color }: { color?: string | null }) {
  const value = color?.trim();
  if (!value) {
    return null;
  }
  return (
    <span
      className="mt-0.5 size-3.5 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: value }}
      aria-hidden
    />
  );
}

/** Row chrome matching user / client-tag settings lists. */
export function OhCatalogRow({
  title,
  meta,
  color,
  isActive = true,
  archiving = false,
  onEdit,
  onArchive,
  onSelect,
}: OhCatalogRowProps) {
  if (onSelect) {
    return (
      <li>
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <CatalogColorSwatch color={color} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-medium text-brand-navy">{title}</p>
            {meta ? (
              <p className="mt-0.5 truncate text-[12px] text-dash-muted">{meta}</p>
            ) : null}
          </div>
          <span className="shrink-0 text-[12px] text-dash-muted">
            {isActive ? "Active" : "Archived"}
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <CatalogColorSwatch color={color} />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-brand-navy">{title}</p>
          {meta ? (
            <p className="mt-0.5 truncate text-[12px] text-dash-muted">{meta}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-[12px] text-dash-muted">
          {isActive ? "Active" : "Archived"}
        </span>
        {onEdit ? (
          <button
            type="button"
            className="text-[13px] font-medium text-brand-primary hover:underline"
            onClick={onEdit}
          >
            Edit
          </button>
        ) : null}
        {onArchive ? (
          <button
            type="button"
            className="text-[13px] text-dash-muted hover:text-brand-navy disabled:opacity-50"
            disabled={archiving || !isActive}
            onClick={onArchive}
          >
            {archiving ? "Archiving" : "Archive"}
          </button>
        ) : null}
      </div>
    </li>
  );
}
