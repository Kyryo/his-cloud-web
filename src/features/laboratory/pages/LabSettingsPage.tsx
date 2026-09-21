"use client";

import { ListPageLayout, ListPageTableSection } from "@/features/app-shell/components/page-layout";
import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import { LabSettingsForm } from "@/features/laboratory/components/catalog/LabSettingsForm";

export function LabSettingsPage() {
  return (
    <ListPageLayout data-testid="lab-settings-page">
      <LabCatalogPageHeader
        title="Laboratory settings"
        description="Tenant defaults for accessioning, release, reporting, and analyzer ingest."
      />
      <ListPageTableSection>
        <LabSettingsForm />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
