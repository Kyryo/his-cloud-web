import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

export function LabOrdersEmptyState() {
  return (
    <ListPageBlankState
      icon="flask"
      title="No laboratory orders yet"
      description="Lab orders created from clinical encounters will appear here for collection, accession, and results."
      data-testid="lab-orders-empty-state"
    />
  );
}
