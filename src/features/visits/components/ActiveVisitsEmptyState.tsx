import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

export function ActiveVisitsEmptyState() {
  return (
    <ListPageBlankState
      icon="calendar"
      title="No active visits"
      description="Walk-in and appointment-backed visits will appear here while they are open."
      data-testid="active-visits-empty-state"
    />
  );
}
