"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { OverviewCharts } from "@/features/reports/components/OverviewCharts";
import type { InsightsFilters } from "@/features/reports/types/insights.types";
import {
  insightsFiltersFromSearchParams,
  insightsFiltersToSearchParams,
} from "@/features/reports/utils/insights-filters";

export function ReportsOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => insightsFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const handleFiltersChange = useCallback(
    (next: InsightsFilters) => {
      const params = insightsFiltersToSearchParams(next);
      router.replace(`?${params.toString()}`);
    },
    [router],
  );

  return (
    <ListPageLayout data-testid="reports-overview-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Overview"
            description="Sales activity, provider performance, and visit trends for the selected period."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>
      <OverviewCharts filters={filters} onFiltersChange={handleFiltersChange} />
    </ListPageLayout>
  );
}
