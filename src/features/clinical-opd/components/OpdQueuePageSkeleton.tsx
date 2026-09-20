import {
  ListPageHeaderSection,
  ListPageLayout,
  ListPageTableSection,
  ListPageToolbarSkeleton,
} from "@/features/app-shell/components/page-layout";
import { OpdQueueTableSkeleton } from "@/features/clinical-opd/components/OpdQueueTableSkeleton";

export function OpdQueuePageSkeleton() {
  return (
    <ListPageLayout data-testid="opd-queue-page-skeleton">
      <ListPageHeaderSection>
        <ListPageToolbarSkeleton showFilter />
      </ListPageHeaderSection>

      <ListPageTableSection>
        <OpdQueueTableSkeleton rows={8} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
