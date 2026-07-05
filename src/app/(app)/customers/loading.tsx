import {
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { CustomersTableSkeleton } from "@/features/customers/components/CustomersTableSkeleton";

export default function Loading() {
  return (
    <ListPageLayout data-testid="customers-page-loading">
      <ListPageTableSection>
        <CustomersTableSkeleton rows={10} />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
