"use client";

import {
  ListPageHeaderSection,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

type IncomingReferralsPageHeaderProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function IncomingReferralsPageHeader({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: IncomingReferralsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="incoming-referrals-search"
        placeholder="Search by client, clinic, or service…"
        searchTestId="incoming-referrals-search"
        searchSubmitTestId="incoming-referrals-search-submit"
        clearTestId="incoming-referrals-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
      />
    </ListPageHeaderSection>
  );
}
