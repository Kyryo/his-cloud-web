"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

type PharmacyHistoryPageHeaderProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function PharmacyHistoryPageHeader({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: PharmacyHistoryPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="pharmacy-history-search"
        placeholder="Search by order, product, or location..."
        searchTestId="pharmacy-history-search"
        searchSubmitTestId="pharmacy-history-search-submit"
        clearTestId="pharmacy-history-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-emerald-300 hover:text-emerald-700"
          >
            <Link href={ROUTES.pharmacyQueue} data-testid="pharmacy-history-queue-link">
              <AppIcon name="pill" className="size-3.5 text-emerald-600" />
              <span>Queue</span>
            </Link>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
