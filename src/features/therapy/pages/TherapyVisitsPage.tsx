"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarX2, SearchX } from "lucide-react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageHeaderMobileSearch,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import {
  ACTIVE_CLINIC_CHANGE_EVENT,
  readActiveClinicId,
} from "@/features/app-shell/utils/active-clinic";
import {
  type TherapyQueueTab,
} from "@/features/therapy/components/TherapyQueueTabs";
import { TherapyVisitSummaryCards } from "@/features/therapy/components/TherapyVisitSummaryCards";
import { TherapyVisitsTable } from "@/features/therapy/components/TherapyVisitsTable";
import { TherapyVisitsToolbar } from "@/features/therapy/components/TherapyVisitsToolbar";
import {
  fetchTherapyDepartments,
  fetchTherapyVisits,
} from "@/features/therapy/services/therapy.service";
import type {
  TherapyDepartment,
  TherapyDiscipline,
  TherapyVisit,
} from "@/features/therapy/types/therapy.types";
import {
  canAccessTherapyDiscipline,
  THERAPY_DISCIPLINE_CONFIG,
} from "@/features/therapy/utils/therapy-access";
import { useUser } from "@/providers/user-provider";

const DEFAULT_PAGE_SIZE = 20;

export function TherapyVisitsPage({
  discipline,
}: {
  discipline: TherapyDiscipline;
}) {
  const { userData, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [activeClinicId, setActiveClinicId] = useState<number | null>(() =>
    readActiveClinicId(),
  );
  const [departments, setDepartments] = useState<TherapyDepartment[]>([]);
  const [departmentUuid, setDepartmentUuid] = useState("");
  const [visits, setVisits] = useState<TherapyVisit[]>([]);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TherapyQueueTab>("active");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = THERAPY_DISCIPLINE_CONFIG[discipline];
  const hasAccess = canAccessTherapyDiscipline(
    userData?.groups ?? [],
    discipline,
  );

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    const fallbackClinicId =
      userData?.clinics?.find((clinic) => clinic.is_primary && clinic.is_active)
        ?.clinic ??
      userData?.clinics?.find((clinic) => clinic.is_active)?.clinic ??
      userData?.primary_clinic?.id ??
      null;

    setActiveClinicId((current) => current ?? fallbackClinicId);
  }, [isUserLoading, userData]);

  useEffect(() => {
    function handleClinicChange(event: Event) {
      const clinicId = (event as CustomEvent<number>).detail;
      setActiveClinicId(clinicId);
    }

    window.addEventListener(ACTIVE_CLINIC_CHANGE_EVENT, handleClinicChange);
    return () => {
      window.removeEventListener(ACTIVE_CLINIC_CHANGE_EVENT, handleClinicChange);
    };
  }, []);

  useEffect(() => {
    if (isUserLoading || !hasAccess || !activeClinicId) {
      setDepartments([]);
      setDepartmentUuid("");
      setIsLoadingDepartments(false);
      return;
    }

    let cancelled = false;
    setIsLoadingDepartments(true);
    setError(null);
    setVisits([]);
    setPage(1);
    setTotalCount(0);
    setHasNext(false);
    setHasPrevious(false);
    setDepartmentUuid("");

    void fetchTherapyDepartments(discipline, activeClinicId)
      .then((records) => {
        if (cancelled) {
          return;
        }
        setDepartments(records);
        setDepartmentUuid((current) => current || records[0]?.uuid || "");
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load therapy departments.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingDepartments(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeClinicId, discipline, hasAccess, isUserLoading]);

  useEffect(() => {
    if (!hasAccess || !activeClinicId || !departmentUuid) {
      setVisits([]);
      return;
    }

    let cancelled = false;
    setIsLoadingVisits(true);
    setError(null);

    void fetchTherapyVisits({
      discipline,
      activeClinicId,
      departmentUuid,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search: activeSearch,
      status: activeTab === "active" ? "active" : "all",
    })
      .then((response) => {
        if (!cancelled) {
          setVisits(response.results);
          setTotalCount(response.pagination?.count ?? response.results.length);
          setHasNext(Boolean(response.pagination?.next));
          setHasPrevious(Boolean(response.pagination?.previous));
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load therapy visits.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingVisits(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeClinicId,
    activeTab,
    activeSearch,
    departmentUuid,
    discipline,
    hasAccess,
    page,
  ]);

  if (isUserLoading) {
    return <PageLoader message={`Loading ${config.label}...`} />;
  }

  if (!hasAccess) {
    return (
      <ListPageLayout data-testid="therapy-access-denied">
        <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-navy">Access denied</h1>
          <p className="mt-2 text-sm text-brand-muted">
            You must belong to the {config.group} group to access {config.label}.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href={ROUTES.settingsAccount}>Back to account</Link>
          </Button>
        </div>
      </ListPageLayout>
    );
  }

  function handleSearchSubmit() {
    setPage(1);
    setActiveSearch(search.trim());
  }

  function handleClearSearch() {
    setPage(1);
    setSearch("");
    setActiveSearch("");
  }

  function handleTabChange(tab: TherapyQueueTab) {
    setPage(1);
    setActiveTab(tab);
  }

  return (
    <ListPageLayout data-testid={`therapy-${discipline}-visits`}>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title={config.queueLabel}
            description={config.description}
          />
        </ListPageHeaderTopRow>
        <ListPageHeaderMobileSearch>
          <Input
            type="search"
            aria-label="Search visits"
            placeholder="Search visits..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearchSubmit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoadingVisits}
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
          {search ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoadingVisits}
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          ) : null}
        </ListPageHeaderMobileSearch>
      </ListPageHeaderSection>

      <ListPageDataSectionsStack>
        <ListPageStatsSection>
          <TherapyVisitSummaryCards visits={visits} />
        </ListPageStatsSection>
        {departments.length > 0 ? (
          <TherapyVisitsToolbar
            search={search}
            activeTab={activeTab}
            isLoading={isLoadingVisits}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onTabChange={handleTabChange}
          />
        ) : null}
      </ListPageDataSectionsStack>

      <ListPageTableSection>
        {isLoadingDepartments || isLoadingVisits ? (
          <PageLoader message="Loading therapy visits..." />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load therapy visits
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
              <CalendarX2 className="size-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-brand-navy">
              No {config.label.toLowerCase()} queue available
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
              The active clinic does not have an available{" "}
              {config.label.toLowerCase()} department.
            </p>
          </div>
        ) : visits.length > 0 ? (
          <div className="space-y-4">
            <TherapyVisitsTable
              visits={visits}
              onRowClick={(visit) =>
                router.push(ROUTES.therapyVisitDetail(discipline, visit.uuid))
              }
            />
            <ListPagePagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoadingVisits}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand-tint text-brand-primary">
              {activeSearch ? (
                <SearchX className="size-6" />
              ) : (
                <CalendarX2 className="size-6" />
              )}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-brand-navy">
              {activeSearch
                ? "No visits found"
                : activeTab === "active"
                  ? "No active visits"
                  : "No visits yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
              {activeSearch
                ? `No visits match "${activeSearch}". Try a different search.`
                : activeTab === "active"
                  ? `There are no active ${config.label.toLowerCase()} visits in this clinic.`
                  : `${config.label} visits will appear here when they are created.`}
            </p>
          </div>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}
