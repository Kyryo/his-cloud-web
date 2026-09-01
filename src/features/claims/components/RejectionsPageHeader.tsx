"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

export function RejectionsPageHeader() {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Rejections"
          description="Payer denial lines and manually rejected remittance lines across all remittance files."
        />
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
