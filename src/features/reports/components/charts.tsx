"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const SalesActivityChart = dynamic(
  () =>
    import("@/features/reports/components/SalesActivityChartInner").then(
      (mod) => mod.SalesActivityChartInner,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
);

export const SalesByProviderChart = dynamic(
  () =>
    import("@/features/reports/components/SalesByProviderChartInner").then(
      (mod) => mod.SalesByProviderChartInner,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
);

export const VisitsByPeriodChart = dynamic(
  () =>
    import("@/features/reports/components/VisitsByPeriodChartInner").then(
      (mod) => mod.VisitsByPeriodChartInner,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  },
);
