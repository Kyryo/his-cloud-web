"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import type { ClinicalReferral } from "@/features/clinical-opd/types/clinical-opd.types";
import { fetchIncomingReferralsAwaitingStart } from "@/features/clinical-opd/services/clinical-opd.service";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { IncomingReferralsEmptyState } from "@/features/referrals/components/IncomingReferralsEmptyState";
import { IncomingReferralsPageHeader } from "@/features/referrals/components/IncomingReferralsPageHeader";
import { IncomingReferralsTableSkeleton } from "@/features/referrals/components/IncomingReferralsTableSkeleton";
import { StartIncomingReferralDialog } from "@/features/referrals/components/StartIncomingReferralDialog";
import { IncomingReferralsTable } from "@/features/referrals/components/tables/incoming-referrals-table";
import { BffError } from "@/lib/bff-client";

function matchesSearch(referral: ClinicalReferral, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = [
    referral.customer_name,
    referral.customer_identifier,
    referral.referring_clinic_name,
    referral.referred_by_name,
    referral.service_type,
    ...(referral.item_summaries ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function IncomingReferralsListPage() {
  const [items, setItems] = useState<ClinicalReferral[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [selectedReferral, setSelectedReferral] =
    useState<ClinicalReferral | null>(null);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    if (opts?.soft) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const results = await fetchIncomingReferralsAwaitingStart();
      setItems(results);
      setIsUnauthorized(false);
    } catch (err) {
      if (err instanceof BffError && err.status === 403) {
        setIsUnauthorized(true);
        setItems([]);
      } else {
        setError(
          err instanceof Error ? err.message : "Could not load referrals.",
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => items.filter((referral) => matchesSearch(referral, appliedSearch)),
    [appliedSearch, items],
  );

  const hasNoRecords = !isLoading && items.length === 0 && !error;
  const isFilteredEmpty =
    !isLoading && items.length > 0 && filtered.length === 0;

  const handleSearchSubmit = useCallback(() => {
    setAppliedSearch(search);
  }, [search]);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    setAppliedSearch("");
  }, []);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <>
      <ListPageLayout data-testid="incoming-referrals-page">
        <IncomingReferralsPageHeader
          search={search}
          isLoading={isRefreshing}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
        />

        <ListPageTableSection>
          {isLoading ? (
            <IncomingReferralsTableSkeleton rows={8} />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-sm font-semibold text-red-800">
                Could not load referrals
              </h2>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void load()}
              >
                Try again
              </Button>
            </div>
          ) : hasNoRecords ? (
            <IncomingReferralsEmptyState />
          ) : isFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
              <h2 className="text-base font-semibold text-brand-navy">
                No matching referrals
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Adjust your search and try again.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleClearSearch}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <IncomingReferralsTable
              referrals={filtered}
              onStart={setSelectedReferral}
            />
          )}
        </ListPageTableSection>
      </ListPageLayout>

      <StartIncomingReferralDialog
        referral={selectedReferral}
        open={Boolean(selectedReferral)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSelectedReferral(null);
          }
        }}
        onStarted={() => {
          setSelectedReferral(null);
          void load({ soft: true });
        }}
      />
    </>
  );
}
