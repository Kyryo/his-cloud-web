"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { PlatformAdminBackupsGrid } from "@/features/platform-admin/components/PlatformAdminBackupsGrid";

export function PlatformAdminBackupsHubPage() {
  return (
    <ListPageLayout data-testid="platform-admin-backups-hub">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Backups"
            description="Choose a service to view backup history, run a backup, or download an archive from R2."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>
      <ListPageTableSection>
        <PlatformAdminBackupsGrid />
      </ListPageTableSection>
    </ListPageLayout>
  );
}
