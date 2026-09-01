"use client";

import { ListPageLayout } from "@/features/app-shell/components/page-layout";
import { OverviewWorkspace } from "@/features/overview/components/OverviewWorkspace";

export function OverviewPage() {
  return (
    <ListPageLayout data-testid="overview-page">
      <OverviewWorkspace />
    </ListPageLayout>
  );
}
