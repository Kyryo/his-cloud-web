import { Badge } from "@/components/ui/badge";
import type { PlatformAdminTenantStatus } from "@/features/platform-admin/types/platform-admin.types";

export function PlatformAdminStatusBadge({
  status,
  isActive,
}: {
  status: PlatformAdminTenantStatus | string;
  isActive?: boolean;
}) {
  if (status === "ACTIVE" && isActive !== false) {
    return <Badge variant="success">Active</Badge>;
  }
  if (status === "SUSPENDED") {
    return <Badge variant="destructive">Suspended</Badge>;
  }
  if (status === "PENDING") {
    return <Badge variant="warning">Pending</Badge>;
  }
  return <Badge variant="secondary">Inactive</Badge>;
}
