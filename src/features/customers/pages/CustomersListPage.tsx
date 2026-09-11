"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { Button } from "@/components/ui/button";
import { CreateAppointmentDialog } from "@/features/appointments/components/CreateAppointmentDialog";
import { CreateCustomerDialog } from "@/features/customers/components/CreateCustomerDialog";
import { CustomerSummaryStatsCards } from "@/features/customers/components/CustomerSummaryStats";
import { CustomersEmptyState } from "@/features/customers/components/CustomersEmptyState";
import { CustomersPageHeader } from "@/features/customers/components/CustomersPageHeader";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { CustomersTableSkeleton } from "@/features/customers/components/CustomersTableSkeleton";
import { CustomerVisitDialog } from "@/features/customers/components/detail/CustomerVisitDialog";
import { UpdateCustomerDialog } from "@/features/customers/components/UpdateCustomerDialog";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  buildCustomerListFilters,
  countActiveCustomerFilters,
  type CustomerListFilterState,
} from "@/features/customers/utils/customer-list-filters";
import {
  CUSTOMER_GENDER_PARAM,
  CUSTOMER_NEW_PARAM,
  CUSTOMER_ORDER_PARAM,
  CUSTOMER_PAGE_PARAM,
  CUSTOMER_SEARCH_PARAM,
  CUSTOMER_STATUS_PARAM,
  customersHref,
  parseCustomerGender,
  parseCustomerOrdering,
  parseCustomerStatus,
  parseListPage,
} from "@/features/customers/utils/customer-list-url";
import {
  fetchCustomerSummaryStats,
  type CustomerSummaryStats as CustomerSummaryStatsData,
} from "@/features/customers/utils/customer-stats";
import { ROUTES } from "@/constants/routes";
import {
  ListPageBlankState,
  ListPageDataSectionsStack,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 20;

export function CustomersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get(CUSTOMER_SEARCH_PARAM) ?? "";
  const page = parseListPage(searchParams.get(CUSTOMER_PAGE_PARAM));
  const gender = parseCustomerGender(searchParams.get(CUSTOMER_GENDER_PARAM));
  const activeStatus = parseCustomerStatus(
    searchParams.get(CUSTOMER_STATUS_PARAM),
  );
  const ordering = parseCustomerOrdering(searchParams.get(CUSTOMER_ORDER_PARAM));
  const createDialogOpen = searchParams.get(CUSTOMER_NEW_PARAM) === "1";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState(urlSearch);
  const [syncedUrlSearch, setSyncedUrlSearch] = useState(urlSearch);
  const [stats, setStats] = useState<CustomerSummaryStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [visitCustomer, setVisitCustomer] = useState<Customer | null>(null);
  const [appointmentCustomer, setAppointmentCustomer] = useState<Customer | null>(
    null,
  );
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [showStats, setShowStats] = useState(false);
  const filters = useMemo(
    () => ({
      gender,
      activeStatus,
      ordering,
      tags: [] as string[],
    }),
    [activeStatus, gender, ordering],
  );

  if (urlSearch !== syncedUrlSearch) {
    setSyncedUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const listFilters = useMemo(
    () =>
      buildCustomerListFilters({
        search: urlSearch,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        ...filters,
      }),
    [filters, page, urlSearch],
  );

  const replaceList = useCallback(
    (next: {
      search?: string;
      page?: number;
      newClient?: boolean;
      gender?: CustomerListFilterState["gender"];
      activeStatus?: CustomerListFilterState["activeStatus"];
      ordering?: CustomerListFilterState["ordering"];
    }) => {
      router.replace(
        customersHref({
          search: next.search ?? urlSearch,
          page: next.page ?? page,
          newClient: next.newClient ?? createDialogOpen,
          gender: next.gender ?? filters.gender,
          activeStatus: next.activeStatus ?? filters.activeStatus,
          ordering: next.ordering ?? filters.ordering,
        }),
      );
    },
    [createDialogOpen, filters, page, router, urlSearch],
  );

  const handleAddClient = useCallback(() => {
    replaceList({ newClient: true });
  }, [replaceList]);

  const handleCustomerCreated = useCallback(
    (customer: Customer) => {
      router.push(ROUTES.customerDetail(customer.uuid));
    },
    [router],
  );

  const reloadCustomers = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetchCustomers(listFilters);
      setCustomers(response.results);
      setTotalCount(response.pagination?.count ?? response.results.length);
      setHasNext(Boolean(response.pagination?.next));
      setHasPrevious(Boolean(response.pagination?.previous));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load clients.";

      if (message.toLowerCase().includes("not authenticated")) {
        setIsUnauthorized(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [listFilters]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setError(null);
        setIsUnauthorized(false);

        const response = await fetchCustomers(listFilters);
        if (cancelled) {
          return;
        }

        setCustomers(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to load clients.";

        if (message.toLowerCase().includes("not authenticated")) {
          setIsUnauthorized(true);
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listFilters]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const summary = await fetchCustomerSummaryStats();
        if (!cancelled) {
          setStats(summary);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setIsStatsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit() {
    setIsRefreshing(true);
    replaceList({ search: search.trim(), page: 1 });
  }

  function handleClearSearch() {
    setIsRefreshing(true);
    setSearch("");
    replaceList({ search: "", page: 1 });
  }

  function handleFiltersApply(
    nextFilters: Pick<
      CustomerListFilterState,
      "gender" | "activeStatus" | "ordering" | "tags"
    >,
  ) {
    setIsRefreshing(true);
    replaceList({
      page: 1,
      gender: nextFilters.gender,
      activeStatus: nextFilters.activeStatus,
      ordering: nextFilters.ordering,
    });
  }

  function handlePageChange(nextPage: number) {
    setIsRefreshing(true);
    replaceList({ page: nextPage });
  }

  function handleRowClick(customer: Customer) {
    router.push(ROUTES.customerDetail(customer.uuid));
  }

  if (isUnauthorized) {
    return (
      <ListPageLayout data-testid="customers-page">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You are not authorized to view clients. Sign in again or contact your
            administrator.
          </p>
          <Button className="mt-6" onClick={() => router.push(ROUTES.auth)}>
            Go to sign in
          </Button>
        </div>
      </ListPageLayout>
    );
  }

  const activeFilterCount = countActiveCustomerFilters(filters);
  const hasActiveQuery = urlSearch.length > 0 || activeFilterCount > 0;
  const hasNoCustomerRecords =
    !isLoading && !error && totalCount === 0 && !hasActiveQuery;
  const isFilteredEmpty =
    !isLoading && !error && customers.length === 0 && hasActiveQuery;

  return (
    <ListPageLayout data-testid="customers-page">
      <CustomersPageHeader
        search={search}
        filters={filters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={handleFiltersApply}
        onAddClient={handleAddClient}
      />
      <CreateCustomerDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            replaceList({ newClient: true });
            return;
          }
          replaceList({ newClient: false });
        }}
        onCreated={handleCustomerCreated}
      />
      {visitCustomer ? (
        <CustomerVisitDialog
          open={Boolean(visitCustomer)}
          customer={visitCustomer}
          onOpenChange={(open) => {
            if (!open) {
              setVisitCustomer(null);
            }
          }}
          onVisitChanged={() => {
            void reloadCustomers();
          }}
        />
      ) : null}
      {appointmentCustomer ? (
        <CreateAppointmentDialog
          customer={appointmentCustomer}
          open={Boolean(appointmentCustomer)}
          onOpenChange={(open) => {
            if (!open) {
              setAppointmentCustomer(null);
            }
          }}
          onCreated={() => {
            setAppointmentCustomer(null);
          }}
        />
      ) : null}
      {editCustomer ? (
        <UpdateCustomerDialog
          open={Boolean(editCustomer)}
          customer={editCustomer}
          onOpenChange={(open) => {
            if (!open) {
              setEditCustomer(null);
            }
          }}
          onUpdated={() => {
            void reloadCustomers();
          }}
        />
      ) : null}
      {!hasNoCustomerRecords ? (
        <FabButton
          label={showStats ? "Hide stats" : "Show stats"}
          icon={BarChart3}
          variant="outline"
          className="bottom-24 bg-white"
          onClick={() => setShowStats((current) => !current)}
          data-testid="customers-show-stats-fab"
        />
      ) : null}
      <FabButton
        label="Add client"
        onClick={handleAddClient}
        data-testid="add-client-fab"
      />

      {!hasNoCustomerRecords ? (
        <ListPageDataSectionsStack className="space-y-0">
          <ListPageStatsSection className={cn(!showStats && "hidden sm:block")}>
            <CustomerSummaryStatsCards stats={stats} isLoading={isStatsLoading} />
          </ListPageStatsSection>

          <ListPageTableSection>
            {isLoading ? (
              <CustomersTableSkeleton rows={10} />
            ) : error ? (
              <ListPageBlankState
                compact
                tone="error"
                icon="users"
                title="Could not load clients"
                description={error}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={() => void reloadCustomers()}
                  >
                    Try again
                  </Button>
                }
              />
            ) : isFilteredEmpty ? (
              <ListPageBlankState
                compact
                icon="search"
                title="No matching clients"
                description="Adjust your search or filters and try again."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg"
                    onClick={handleClearSearch}
                  >
                    Clear search and filters
                  </Button>
                }
              />
            ) : (
              <>
                <CustomersTable
                  customers={customers}
                  onRowClick={handleRowClick}
                  onStartVisit={(customer) => setVisitCustomer(customer)}
                  onBookAppointment={(customer) => setAppointmentCustomer(customer)}
                  onEditCustomer={(customer) => setEditCustomer(customer)}
                />
                <ListPagePagination
                  page={page}
                  pageSize={DEFAULT_PAGE_SIZE}
                  totalCount={totalCount}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  isLoading={isRefreshing}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </ListPageTableSection>
        </ListPageDataSectionsStack>
      ) : (
        <ListPageTableSection>
          <CustomersEmptyState onAddClient={handleAddClient} />
        </ListPageTableSection>
      )}
    </ListPageLayout>
  );
}
