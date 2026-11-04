"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { fetchOhEmployersPage } from "@/features/occupational-health/services/oh.service";
import type { OhEmployer } from "@/features/occupational-health/types";
import { OhCreateEmployerDialog } from "@/features/settings/components/modules/occupational-health/OhCreateEmployerDialog";
import { OhEmployerWorkspaceSheet } from "@/features/settings/components/modules/occupational-health/OhEmployerWorkspaceSheet";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const EMPLOYERS_QUERY_KEY = ["oh-employers", "settings-directory"] as const;
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 sm:grid-cols-[minmax(0,1.4fr)_11rem_7rem]";

type OhEmployersSettingsTabProps = {
  isActive: boolean;
};

export function OhEmployersSettingsTab({ isActive }: OhEmployersSettingsTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<OhEmployer | null>(null);
  const employersQuery = useQuery({
    queryKey: [...EMPLOYERS_QUERY_KEY, page],
    queryFn: () => fetchOhEmployersPage({ page, pageSize: PAGE_SIZE }),
    enabled: isActive,
    placeholderData: keepPreviousData,
  });

  if (!isActive) {
    return null;
  }

  const rows = employersQuery.data?.results ?? [];
  const pagination = employersQuery.data?.pagination;
  const totalCount = pagination?.count ?? rows.length;

  function refreshEmployers() {
    void queryClient.invalidateQueries({ queryKey: EMPLOYERS_QUERY_KEY });
  }

  return (
    <section className="pt-5" aria-labelledby="oh-employers-title">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="oh-employers-title" className="text-[15px] font-semibold text-brand-navy">
            Employers
            {employersQuery.isSuccess ? (
              <span className="ml-2 text-[13px] font-normal tabular-nums text-dash-muted">
                {totalCount}
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-[13px] text-dash-muted">
            Open a company to set its risk profiles, departments and job titles.
          </p>
        </div>
        <PrimaryButton
          type="button"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="h-8 shrink-0 gap-1.5 px-3 text-[13px]"
        >
          <Plus className="size-3.5" aria-hidden />
          Add employer
        </PrimaryButton>
      </header>

      <div className="mt-4">
        {employersQuery.isPending ? (
          <DirectorySkeleton />
        ) : employersQuery.isError ? (
          <div className="border-l-2 border-red-400 py-2 pl-4">
            <p className="text-sm font-medium text-red-800">Employers could not be loaded</p>
            <p className="mt-1 text-sm text-red-700">{getErrorMessage(employersQuery.error)}</p>
            <SecondaryButton
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => void employersQuery.refetch()}
            >
              Try again
            </SecondaryButton>
          </div>
        ) : rows.length === 0 ? (
          <EmptyDirectory onAdd={() => setIsCreating(true)} />
        ) : (
          <>
            <div
              aria-hidden
              className={cn(
                ROW_GRID,
                "hidden border-b border-dash-border px-2 pb-2 text-[12px] font-medium text-dash-muted sm:grid",
              )}
            >
              <span>Employer</span>
              <span>Registration no.</span>
              <span>Status</span>
            </div>
            <ul
              className={cn(
                "divide-y divide-dash-border transition-opacity",
                employersQuery.isPlaceholderData && "opacity-60",
              )}
            >
              {rows.map((row) => (
                <li key={row.uuid}>
                  <EmployerRow employer={row} onOpen={() => setSelectedEmployer(row)} />
                </li>
              ))}
            </ul>
            {totalCount > PAGE_SIZE ? (
              <div className="mt-4 border-t border-dash-border pt-2">
                <ListPagePagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalCount={totalCount}
                  hasNext={Boolean(pagination?.next)}
                  hasPrevious={Boolean(pagination?.previous)}
                  isLoading={employersQuery.isFetching}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      {isCreating ? (
        <OhCreateEmployerDialog
          open
          onOpenChange={setIsCreating}
          onCreated={(created) => {
            setIsCreating(false);
            setPage(1);
            refreshEmployers();
            setSelectedEmployer(created);
          }}
        />
      ) : null}

      <OhEmployerWorkspaceSheet
        employer={selectedEmployer}
        open={selectedEmployer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEmployer(null);
          }
        }}
        onEmployerUpdated={(updated) => {
          setSelectedEmployer(updated);
          refreshEmployers();
        }}
        onEmployerArchived={() => {
          setSelectedEmployer(null);
          refreshEmployers();
        }}
      />
    </section>
  );
}

function EmployerRow({ employer, onOpen }: { employer: OhEmployer; onOpen: () => void }) {
  const isActive = employer.is_active !== false;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        ROW_GRID,
        "w-full px-2 py-3 text-left hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
      )}
    >
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-[13.5px] font-medium",
            isActive ? "text-brand-navy" : "text-dash-muted",
          )}
        >
          {employer.name}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-dash-muted">
          {employer.code || "No code"}
          <span className="sm:hidden">
            {employer.registration_number ? ` · ${employer.registration_number}` : ""}
          </span>
        </span>
      </span>

      <span className="hidden truncate text-[13px] text-brand-slate sm:block">
        {employer.registration_number || <span className="text-dash-muted">Not set</span>}
      </span>

      <span
        className={cn(
          "hidden text-[13px] sm:block",
          isActive ? "text-brand-navy" : "text-dash-muted",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

function EmptyDirectory({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-b border-dash-border py-14 text-center">
      <p className="text-[15px] font-semibold text-brand-navy">No employers yet</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-dash-muted">
        Add the first company you examine for. Its risk profiles, departments and job
        titles decide which exams and certificates its staff need.
      </p>
      <PrimaryButton
        type="button"
        size="sm"
        onClick={onAdd}
        className="mt-4 h-8 gap-1.5 px-3 text-[13px]"
      >
        <Plus className="size-3.5" aria-hidden />
        Add employer
      </PrimaryButton>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="divide-y divide-dash-border border-t border-dash-border" aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className={cn(ROW_GRID, "px-2 py-3")}>
          <span className="space-y-1.5">
            <span className="block h-3.5 w-44 animate-pulse rounded bg-slate-100" />
            <span className="block h-3 w-16 animate-pulse rounded bg-slate-100" />
          </span>
          <span className="hidden h-3.5 w-24 animate-pulse rounded bg-slate-100 sm:block" />
          <span className="hidden h-3.5 w-14 animate-pulse rounded bg-slate-100 sm:block" />
        </div>
      ))}
    </div>
  );
}
