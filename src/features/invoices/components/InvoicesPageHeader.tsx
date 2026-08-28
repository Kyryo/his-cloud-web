"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

export function InvoicesPageHeader() {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Invoices"
          description="Review posted customer invoices from ERP."
        />
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
