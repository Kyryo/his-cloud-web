import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { ACTIONS } from "@/constants/copy";
import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

type SalesOrdersEmptyStateProps = {
  onNewOrder: () => void;
};

export function SalesOrdersEmptyState({
  onNewOrder,
}: SalesOrdersEmptyStateProps) {
  return (
    <ListPageBlankState
      icon="file"
      title="No sales orders yet"
      description="Charge a client to create the first order. Visit billing will also appear here."
      data-testid="sales-orders-empty-state"
      action={
        <PageActionButton
          onClick={onNewOrder}
          data-testid="create-first-sales-order-button"
        >
          <AppIcon name="add" className="size-4" />
          {ACTIONS.newOrder}
        </PageActionButton>
      }
    />
  );
}
