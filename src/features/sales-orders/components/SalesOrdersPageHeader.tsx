"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type SalesOrdersPageHeaderProps = {
  onNewOrder: () => void;
};

export function SalesOrdersPageHeader({ onNewOrder }: SalesOrdersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Sales orders"
          description="Review quotations and confirmed orders synced from ERP."
        />

        <ListPageHeaderActions>
          <AddActionButton
            label="New order"
            className="hidden shrink-0 self-start sm:inline-flex"
            onClick={onNewOrder}
            data-testid="new-sales-order-button"
          />
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
