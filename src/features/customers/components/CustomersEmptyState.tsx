import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { ACTIONS } from "@/constants/copy";
import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

type CustomersEmptyStateProps = {
  onAddClient: () => void;
};

export function CustomersEmptyState({ onAddClient }: CustomersEmptyStateProps) {
  return (
    <ListPageBlankState
      icon="users"
      title="No clients yet"
      description="Register the first client to start visits, appointments, and billing."
      data-testid="customers-empty-state"
      action={
        <PageActionButton onClick={onAddClient} data-testid="add-first-client-button">
          <AppIcon name="add" className="size-4" />
          {ACTIONS.registerClient}
        </PageActionButton>
      }
    />
  );
}
