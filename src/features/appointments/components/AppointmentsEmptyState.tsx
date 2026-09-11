import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { ACTIONS } from "@/constants/copy";
import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

type AppointmentsEmptyStateProps = {
  onNewAppointment: () => void;
};

export function AppointmentsEmptyState({
  onNewAppointment,
}: AppointmentsEmptyStateProps) {
  return (
    <ListPageBlankState
      icon="calendarClock"
      title="No appointments yet"
      description="Book clinic time for a client. Bookings will show in the list, board, and calendar."
      data-testid="appointments-empty-state"
      action={
        <PageActionButton
          onClick={onNewAppointment}
          data-testid="schedule-first-appointment-button"
        >
          <AppIcon name="add" className="size-4" />
          {ACTIONS.newAppointment}
        </PageActionButton>
      }
    />
  );
}
