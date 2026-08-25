"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type CustomersPageHeaderProps = {
  onAddClient: () => void;
};

export function CustomersPageHeader({ onAddClient }: CustomersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Clients"
          description="Manage client registrations, visits, and activity."
        />

        <ListPageHeaderActions>
          <AddActionButton
            label="Add client"
            className="hidden shrink-0 self-start sm:inline-flex"
            onClick={onAddClient}
            data-testid="add-client-button"
          />
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
