import { AnalyticsComingSoon } from "@/features/reports/components/AnalyticsComingSoon";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";

export function ReportsAnalyticsPage() {
  return (
    <ListPageLayout data-testid="reports-analytics-page">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Analytics"
            description="Advanced analytics dashboards will appear here."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>
      <AnalyticsComingSoon />
    </ListPageLayout>
  );
}
