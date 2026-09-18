import {
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { LabOrdersTableSkeleton } from "@/features/laboratory/components/LabOrdersTableSkeleton";

export default function Loading() {
  return (
    <ListPageLayout data-testid="lab-orders-page-loading">
      <ListPageTableSection>
        <LabOrdersTableSkeleton rows={10} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
