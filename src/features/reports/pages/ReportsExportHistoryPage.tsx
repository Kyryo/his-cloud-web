"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { ReportExportHistoryTable } from "@/features/reports/components/ReportExportHistoryTable";

export function ReportsExportHistoryPage() {
  return (
    <ListPageLayout data-testid="reports-export-history-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Export history"
            description="Track the status of queued exports and download completed CSV files."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ReportExportHistoryTable />
    </ListPageLayout>
  );
}
