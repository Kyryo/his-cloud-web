"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { ActiveVisitsTable } from "@/features/visits/components/tables/active-visits-table";
import { useVisitsList } from "@/features/visits/hooks/use-visits-list";
import { fetchVisits } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";

export function ActiveVisitsListPage() {
  const router = useRouter();
  const fetchFn = useCallback(
    (filters: Parameters<typeof fetchVisits>[0]) =>
      fetchVisits({ ...filters, status: "active", isActive: true }),
    [],
  );

  const {
    items,
    totalCount,
    page,
    pageSize,
    search,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    reload,
    handlePageChange,
  } = useVisitsList<VisitDetail>({ fetchFn });

  const handleRowClick = useCallback(
    (visit: VisitDetail) => router.push(ROUTES.visitDetail(visit.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout className="space-y-4" data-testid="active-visits-page">
      <InventoryListPageHeader
        title="Active visits"
        description="Patients currently in clinic with open visits and encounters."
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by client, identifier, or service..."
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack className="space-y-2">
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by client, identifier, or service..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            compact
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading active visits..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load active visits"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Calendar}
            title="No active visits"
            description="Walk-in and appointment-backed visits will appear here while they are open."
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching active visits"
      >
        <div className="space-y-2">
          <ActiveVisitsTable visits={items} onRowClick={handleRowClick} />
          <InventoryListPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isLoading={isRefreshing}
            onPageChange={handlePageChange}
          />
        </div>
      </InventoryListPageContent>
    </ListPageLayout>
  );
}
