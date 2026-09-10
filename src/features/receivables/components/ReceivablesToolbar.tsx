"use client";

import { ListPageHeaderSection, ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { ReceivablesViewToggle } from "@/features/receivables/components/ReceivablesViewToggle";
import type { ReceivablesView } from "@/features/receivables/utils/receivables-views";

type ReceivablesToolbarProps = {
  view: ReceivablesView;
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function ReceivablesToolbar({
  view,
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: ReceivablesToolbarProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="receivables-search"
        placeholder={
          view === "debtors"
            ? "Search clients by name or ID"
            : "Search invoices by number or client"
        }
        searchTestId="receivables-search"
        clearTestId="receivables-search-clear"
        isLoading={isLoading}
        showSearchButton={false}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={<ReceivablesViewToggle view={view} search={search} />}
      />
    </ListPageHeaderSection>
  );
}
