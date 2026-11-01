"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import { fetchOhEmployersPage } from "@/features/occupational-health/services/oh.service";
import type { OhEmployer } from "@/features/occupational-health/types";
import { OhCreateEmployerDialog } from "@/features/settings/components/modules/occupational-health/OhCreateEmployerDialog";
import { OhEmployerWorkspaceSheet } from "@/features/settings/components/modules/occupational-health/OhEmployerWorkspaceSheet";
import {
  employerInitials,
  monogramToneIndex,
} from "@/features/settings/components/modules/occupational-health/employerMonogram";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const EMPLOYERS_QUERY_KEY = ["oh-employers", "settings-directory"] as const;
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 sm:grid-cols-[minmax(0,1fr)_11rem_6.5rem_1.25rem]";

const MONOGRAM_TONES = [
  "bg-brand-tint text-brand-primary",
  "bg-brand-green-tint text-brand-green",
  "bg-brand-warm text-brand-amber",
] as const;

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
    <section className="pt-6" aria-labelledby="oh-employers-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[56ch]">
          <div className="flex items-baseline gap-3">
            <h2
              id="oh-employers-title"
              className="text-xl font-semibold tracking-tight text-brand-navy"
            >
              Employers
            </h2>
            {employersQuery.isSuccess ? (
              <span className="text-sm tabular-nums text-dash-muted">{totalCount}</span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-dash-muted">
            Companies whose staff you examine. Open one to set up its risk profiles,
            departments and job titles.
          </p>
        </div>
        <PrimaryButton
          type="button"
          onClick={() => setIsCreating(true)}
          className="shrink-0 gap-1.5 active:translate-y-px"
        >
          <Plus className="size-4" aria-hidden />
          Add employer
        </PrimaryButton>
      </header>

      <div className="mt-8">
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
                "hidden border-b border-dash-border pb-2.5 pl-3 pr-2 text-xs font-medium text-dash-muted sm:grid",
              )}
            >
              <span>Employer</span>
              <span>Registration no.</span>
              <span>Status</span>
              <span />
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
  const tone = MONOGRAM_TONES[monogramToneIndex(employer.uuid, MONOGRAM_TONES.length)];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        ROW_GRID,
        "group relative w-full py-3.5 pl-3 pr-2 text-left transition-colors duration-200",
        "hover:bg-brand-tint/35 focus-visible:bg-brand-tint/35 focus-visible:outline-none",
        "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:origin-center before:scale-y-0 before:rounded-full before:bg-brand-primary before:transition-transform before:duration-200",
        "hover:before:scale-y-100 focus-visible:before:scale-y-100 motion-reduce:before:transition-none",
      )}
    >
      <span className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tracking-wide",
            isActive ? tone : "bg-slate-100 text-slate-400",
          )}
        >
          {employerInitials(employer.name)}
        </span>
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-[15px] font-medium",
              isActive ? "text-brand-navy" : "text-dash-muted",
            )}
          >
            {employer.name}
          </span>
          <span className="mt-0.5 block truncate font-mono text-xs text-dash-muted">
            {employer.code || "No code"}
            <span className="font-sans sm:hidden">
              {employer.registration_number ? `, ${employer.registration_number}` : ""}
            </span>
          </span>
        </span>
      </span>

      <span className="hidden truncate text-sm tabular-nums text-brand-slate sm:block">
        {employer.registration_number || <span className="text-slate-300">Not set</span>}
      </span>

      <span
        className={cn(
          "hidden items-center gap-2 text-sm sm:inline-flex",
          isActive ? "text-brand-navy" : "text-dash-muted",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            isActive ? "bg-emerald-500" : "bg-slate-300",
          )}
        />
        {isActive ? "Active" : "Inactive"}
      </span>

      <ArrowRight
        className="size-4 text-slate-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-brand-primary motion-reduce:transition-none"
        aria-hidden
      />
    </button>
  );
}

function EmptyDirectory({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid items-center gap-8 border-y border-dash-border py-12 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 sm:px-4">
      <div aria-hidden className="relative mx-auto size-24 sm:mx-0">
        <span className="absolute inset-0 rounded-full border border-dashed border-brand-primary/30" />
        <span className="absolute inset-3 rounded-full bg-brand-tint" />
        <Building2
          className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-brand-primary"
          strokeWidth={1.5}
        />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-base font-semibold text-brand-navy">No employers yet</p>
        <p className="mt-1 max-w-[46ch] text-sm leading-6 text-dash-muted">
          Add the first company you examine for. Its risk profiles, departments and job
          titles decide which exams and certificates its staff need.
        </p>
        <PrimaryButton type="button" onClick={onAdd} className="mt-4 gap-1.5">
          <Plus className="size-4" aria-hidden />
          Add employer
        </PrimaryButton>
      </div>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="divide-y divide-dash-border border-t border-dash-border" aria-hidden>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className={cn(ROW_GRID, "py-3.5 pl-3 pr-2")}>
          <span className="flex items-center gap-3.5">
            <span className="size-10 animate-pulse rounded-full bg-slate-100" />
            <span className="space-y-1.5">
              <span className="block h-3.5 w-44 animate-pulse rounded bg-slate-100" />
              <span className="block h-3 w-16 animate-pulse rounded bg-slate-100" />
            </span>
          </span>
          <span className="hidden h-3.5 w-24 animate-pulse rounded bg-slate-100 sm:block" />
          <span className="hidden h-3.5 w-14 animate-pulse rounded bg-slate-100 sm:block" />
          <span />
        </div>
      ))}
    </div>
  );
}
