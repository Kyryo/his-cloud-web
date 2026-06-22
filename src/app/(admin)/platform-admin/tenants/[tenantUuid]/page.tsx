import { PlatformAdminTenantDetailPage } from "@/features/platform-admin/pages/PlatformAdminTenantDetailPage";

type PageProps = {
  params: Promise<{ tenantUuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { tenantUuid } = await params;
  return <PlatformAdminTenantDetailPage tenantUuid={tenantUuid} />;
}
