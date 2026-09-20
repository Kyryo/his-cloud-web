import {
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { LabOrdersTableSkeleton } from "@/features/laboratory/components/LabOrdersTableSkeleton";

export default function Loading() {
  return (
    <ListPageLayout data-testid="lab-settings-page-loading">
      <ListPageTableSection>
        <LabOrdersTableSkeleton rows={6} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
