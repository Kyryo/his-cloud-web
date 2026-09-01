"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

type PharmacyQueuePageHeaderProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function PharmacyQueuePageHeader({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: PharmacyQueuePageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="pharmacy-queue-search"
        placeholder="Search by order or patient..."
        searchTestId="pharmacy-queue-search"
        searchSubmitTestId="pharmacy-queue-search-submit"
        clearTestId="pharmacy-queue-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-blue-300 hover:text-blue-700"
          >
            <Link href={ROUTES.pharmacyHistory} data-testid="pharmacy-queue-history-link">
              <AppIcon name="calendarClock" className="size-3.5 text-blue-600" />
              <span>History</span>
            </Link>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}
