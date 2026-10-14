"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { OverviewSkeleton } from "@/features/platform-admin/components/overview/OverviewSkeleton";
import { PlatformAdminOverviewView } from "@/features/platform-admin/components/overview/PlatformAdminOverviewView";
import {
  usePlatformAdminDashboardQuery,
  usePlatformAdminOverviewQuery,
} from "@/features/platform-admin/hooks/use-platform-admin-overview-query";

export function PlatformAdminOverviewPage() {
  const { data, error, isPending, isFetching, refetch } =
    usePlatformAdminOverviewQuery();
  const dashboardQuery = usePlatformAdminDashboardQuery();

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load overview.");
    }
  }, [error]);

  return (
    <ListPageLayout>
      {isPending || !data ? (
        <OverviewSkeleton />
      ) : (
        <PlatformAdminOverviewView
          overview={data.overview}
          tenants={data.tenants}
          tenantsArePartial={data.tenantsArePartial}
          dashboard={dashboardQuery.data ?? null}
          isRefreshing={isFetching}
          onRefresh={() => {
            void refetch();
            void dashboardQuery.refetch();
          }}
          onFinanceRecorded={() => void refetch()}
        />
      )}
    </ListPageLayout>
  );
}
