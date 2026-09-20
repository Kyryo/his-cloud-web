"use client";

import type { ReactNode } from "react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { OpdQueueViewToggle } from "@/features/clinical-opd/components/OpdQueueViewToggle";
import type { OpdQueueViewMode } from "@/features/clinical-opd/utils/opd-queue-views";
import { cn } from "@/lib/utils";

export type OpdQueueListToolbarProps = {
  search: string;
  viewMode: OpdQueueViewMode;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onViewModeChange: (mode: OpdQueueViewMode) => void;
  trailing?: ReactNode;
  className?: string;
};

export function OpdQueueListToolbar({
  search,
  viewMode,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onViewModeChange,
  trailing,
  className,
}: OpdQueueListToolbarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="opd-queue-search"
        placeholder="Search by name, ID, phone, or department…"
        searchTestId="opd-queue-search"
        searchSubmitTestId="opd-queue-search-submit"
        clearTestId="opd-queue-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={
          <div className="flex items-center gap-3">
            <OpdQueueViewToggle
              viewMode={viewMode}
              onChange={onViewModeChange}
            />
            {trailing}
          </div>
        }
      />
    </div>
  );
}