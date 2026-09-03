"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { OpdQueueListToolbar } from "@/features/clinical-opd/components/OpdQueueListToolbar";
import type { OpdQueueListFilterState } from "@/features/clinical-opd/utils/opd-queue-list-filters";

type OpdQueuePageHeaderProps = {
  search: string;
  filters: OpdQueueListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: OpdQueueListFilterState) => void;
  onRefresh: () => void;
};

export function OpdQueuePageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onRefresh,
}: OpdQueuePageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <OpdQueueListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
            >
              <Link href={ROUTES.activeVisits}>
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                <AppIcon name="heartPulse" className="size-3.5 text-emerald-600" />
                <span>Active Queue</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate"
              disabled={isLoading}
              onClick={onRefresh}
              data-testid="opd-queue-refresh-button"
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />
    </ListPageHeaderSection>
  );
}
