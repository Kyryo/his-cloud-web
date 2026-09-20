"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { OpdQueueListToolbar } from "@/features/clinical-opd/components/OpdQueueListToolbar";
import type { OpdQueueViewMode } from "@/features/clinical-opd/utils/opd-queue-views";

type OpdQueuePageHeaderProps = {
  search: string;
  viewMode: OpdQueueViewMode;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onViewModeChange: (mode: OpdQueueViewMode) => void;
  onRefresh: () => void;
};

export function OpdQueuePageHeader({
  search,
  viewMode,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onViewModeChange,
  onRefresh,
}: OpdQueuePageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <OpdQueueListToolbar
        search={search}
        viewMode={viewMode}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onViewModeChange={onViewModeChange}
        trailing={
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
            >
              <Link href={ROUTES.activeVisits}>
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