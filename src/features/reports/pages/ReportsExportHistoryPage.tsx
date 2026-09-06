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
import { ReportsExportHistoryList } from "@/features/reports/components/ReportsExportHistoryList";
import { ROUTES } from "@/constants/routes";

export function ReportsExportHistoryPage() {
  return (
    <ListPageLayout data-testid="reports-export-history-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Export history"
            description="Download finished files, or cancel one that is still generating."
          />
          <ListPageHeaderActions>
            <PrimaryButton asChild size="sm">
              <Link href={ROUTES.reportsExports}>New export</Link>
            </PrimaryButton>
          </ListPageHeaderActions>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ReportsExportHistoryList />
    </ListPageLayout>
  );
}
