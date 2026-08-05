import { PlatformAdminBackupsPage } from "@/features/platform-admin/pages/PlatformAdminBackupsPage";

export default function Page() {
  return (
    <PlatformAdminBackupsPage
      target="hmis"
      title="HMIS backups"
      description="PostgreSQL database and media archives stored in Cloudflare R2."
    />
  );
}
