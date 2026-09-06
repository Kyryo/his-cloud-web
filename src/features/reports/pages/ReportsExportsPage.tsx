"use client";

import Link from "next/link";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { ReportsCatalogList } from "@/features/reports/components/ReportsCatalogList";
import { ReportsRecentExports } from "@/features/reports/components/ReportsRecentExports";
import { ROUTES } from "@/constants/routes";

export function ReportsExportsPage() {
  return (
    <ListPageLayout data-testid="reports-exports-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Reports"
            description="Choose a report, set the period and filters, and download a CSV."
          />
          <ListPageHeaderActions>
            <PrimaryButton asChild size="sm">
              <Link href={ROUTES.reportsExportHistory}>Export history</Link>
            </PrimaryButton>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-12">
        <ReportsCatalogList />
        <div className="xl:sticky xl:top-6 xl:self-start">
          <ReportsRecentExports />
        </div>
      </div>
    </ListPageLayout>
  );
}
