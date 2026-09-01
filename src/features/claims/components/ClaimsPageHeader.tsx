"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

export function ClaimsPageHeader() {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Submissions"
          description="Track insurance claims from draft through submission."
        />
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
