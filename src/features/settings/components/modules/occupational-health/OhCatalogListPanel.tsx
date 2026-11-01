"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

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
            embedded && "bg-transparent",
          )}
        >
          <p className="text-sm font-medium text-brand-navy">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-400">{emptyDescription}</p>
        </div>
      ) : (
        children
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
            <p className="text-[13px] leading-5 text-slate-400">{description}</p>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={onAdd}
          >
            {addLabel}
          </Button>
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
  isActive?: boolean;
  archiving?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  /** Whole-row click (e.g. open employer workspace). Hides edit/archive. */
  onSelect?: () => void;
};

/** Row chrome matching user / client-tag settings lists. */
export function OhCatalogRow({
  title,
  meta,
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
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {title}
            </p>
            {meta ? (
              <p className="mt-0.5 truncate text-sm text-slate-400">{meta}</p>
            ) : null}
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {isActive ? "Active" : "Archived"}
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-navy"
            aria-hidden
          />
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-brand-navy">{title}</p>
        {meta ? (
          <p className="mt-0.5 truncate text-sm text-slate-400">{meta}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-slate-400">
          {isActive ? "Active" : "Archived"}
        </span>
        {onEdit ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-brand-muted hover:text-brand-navy"
            onClick={onEdit}
          >
            Edit
          </Button>
        ) : null}
        {onArchive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-brand-muted hover:text-brand-navy"
            disabled={archiving || !isActive}
            onClick={onArchive}
          >
            Archive
          </Button>
        ) : null}
      </div>
    </li>
  );
}
