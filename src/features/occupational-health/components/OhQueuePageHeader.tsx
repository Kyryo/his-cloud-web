"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ListPageHeaderSection,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

type OhQueuePageHeaderProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onRefresh: () => void;
};

export function OhQueuePageHeader({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onRefresh,
}: OhQueuePageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="oh-queue-search"
        placeholder="Search by client, department, clinician, or status…"
        searchTestId="oh-queue-search"
        searchSubmitTestId="oh-queue-search-submit"
        clearTestId="oh-queue-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate"
            disabled={isLoading}
            onClick={onRefresh}
            data-testid="oh-queue-refresh-button"
          >
            <RefreshCw className="size-3.5" />
            <span>Refresh</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
