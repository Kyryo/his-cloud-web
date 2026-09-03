import {
  ListPageDataSectionsStack,
  ListPageHeaderSection,
  ListPageLayout,
  ListPageStatsSection,
  ListPageTableSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";
import { OpdQueueSummaryStatsCards } from "@/features/clinical-opd/components/OpdQueueSummaryStatsCards";
import { OpdQueueTableSkeleton } from "@/features/clinical-opd/components/OpdQueueTableSkeleton";

export function OpdQueuePageSkeleton() {
  return (
    <ListPageLayout data-testid="opd-queue-page-skeleton">
      <ListPageHeaderSection>
        <ListPageToolbarSkeleton showFilter />
      </ListPageHeaderSection>

      <ListPageDataSectionsStack>
        <ListPageStatsSection>
          <OpdQueueSummaryStatsCards stats={null} isLoading />
        </ListPageStatsSection>
      </ListPageDataSectionsStack>

      <ListPageTableSection>
        <OpdQueueTableSkeleton rows={8} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
