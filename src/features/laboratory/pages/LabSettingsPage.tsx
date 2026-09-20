"use client";

import { LabCatalogPageHeader } from "@/features/laboratory/components/catalog/LabCatalogPageHeader";
import { LabSettingsForm } from "@/features/laboratory/components/catalog/LabSettingsForm";
import { ListPageLayout } from "@/features/app-shell/components/page-layout";

export function LabSettingsPage() {
  return (
    <ListPageLayout data-testid="lab-settings-page">
      <LabCatalogPageHeader
        title="Laboratory settings"
        description="Tenant defaults for accessioning, release, reporting, and analyzer ingest."
      />
      <LabSettingsForm />
    </ListPageLayout>
  );
}
