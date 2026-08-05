import { PlatformAdminBackupsPage } from "@/features/platform-admin/pages/PlatformAdminBackupsPage";

export default function Page() {
  return (
    <PlatformAdminBackupsPage
      target="claims_engine"
      title="Claims engine backups"
      description="Claims-engine MySQL database archives stored in Cloudflare R2."
    />
  );
}
