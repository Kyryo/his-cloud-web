"use client";

import type { ReactNode } from "react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { OpdQueueStageBoards } from "@/features/clinical-opd/components/OpdQueueStageBoards";
import type { OpdQueueListFilterState } from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { cn } from "@/lib/utils";

export type OpdQueueListToolbarProps = {
  search: string;
  filters: OpdQueueListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: OpdQueueListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function OpdQueueListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
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
        trailing={trailing}
      />
      <OpdQueueStageBoards
        filters={filters}
        isLoading={isLoading}
        onChange={onFiltersApply}
      />
    </div>
  );
}
