"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type RemittancesPageHeaderProps = {
  onUploadClick: () => void;
};

export function RemittancesPageHeader({ onUploadClick }: RemittancesPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Remittances"
          description="Upload payer remittance advice, reconcile totals, and apply settlements."
        />
        <ListPageHeaderActions>
          <AddActionButton
            label="Upload remittance"
            showIcon={false}
            onClick={onUploadClick}
            data-testid="remittance-upload-open"
          />
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
