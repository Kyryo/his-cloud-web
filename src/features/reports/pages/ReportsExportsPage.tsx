"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { ReportsCatalogGrid } from "@/features/reports/components/ReportsCatalogGrid";

export function ReportsExportsPage() {
  return (
    <ListPageLayout data-testid="reports-exports-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Reports"
            description="Browse available exports, configure filters, and download CSV files."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ReportsCatalogGrid />
    </ListPageLayout>
  );
}
