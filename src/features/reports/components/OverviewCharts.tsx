"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SalesActivityChart,
  SalesByProviderChart,
  VisitsByPeriodChart,
} from "@/features/reports/components/charts";
import { OverviewPeriodFilters } from "@/features/reports/components/OverviewPeriodFilters";
import {
  fetchSalesActivity,
  fetchSalesByProvider,
  fetchVisitsByPeriod,
} from "@/features/reports/services/insights.service";
import type { InsightsFilters } from "@/features/reports/types/insights.types";
import { cn } from "@/lib/utils";

const CHART_CARD_CLASS = "border-brand-border bg-white shadow-none";

type OverviewChartsProps = {
  filters: InsightsFilters;
  onFiltersChange: (filters: InsightsFilters) => void;
};

export function OverviewCharts({ filters, onFiltersChange }: OverviewChartsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesActivity, setSalesActivity] = useState<
    Awaited<ReturnType<typeof fetchSalesActivity>>["series"]
  >([]);
  const [salesByProvider, setSalesByProvider] = useState<
    Awaited<ReturnType<typeof fetchSalesByProvider>>["providers"]
  >([]);
  const [visitsByPeriod, setVisitsByPeriod] = useState<
    Awaited<ReturnType<typeof fetchVisitsByPeriod>>["series"]
  >([]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const [activity, providers, visits] = await Promise.all([
          fetchSalesActivity(filters),
          fetchSalesByProvider(filters),
          fetchVisitsByPeriod(filters),
        ]);
        if (cancelled) {
          return;
        }
        setSalesActivity(activity.series);
        setSalesByProvider(providers.providers);
        setVisitsByPeriod(visits.series);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load charts.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  if (error) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className={cn("lg:col-span-2", CHART_CARD_CLASS)}>
        <CardHeader className="space-y-4">
          <CardTitle className="text-base">Sales activity</CardTitle>
          <OverviewPeriodFilters filters={filters} onChange={onFiltersChange} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <SalesActivityChart data={salesActivity} />
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">Sales by provider</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <SalesByProviderChart data={salesByProvider} />
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">Visits by period</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <VisitsByPeriodChart data={visitsByPeriod} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
