import { ArrowUpRight, Building2 } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { PlatformAdminStatusBadge } from "@/features/platform-admin/components/PlatformAdminStatusBadge";
import type { PlatformAdminTenant } from "@/features/platform-admin/types/platform-admin.types";
import { formatRelativeDate } from "@/features/platform-admin/utils/overview-series";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

type Props = { tenants: PlatformAdminTenant[] };

export function OverviewRecentTenants({ tenants }: Props) {
  return (
    <OverviewSection
      title="Recently onboarded"
      actions={
        <Link
          href={ROUTES.platformAdminTenants}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          All tenants <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      }
    >
      {tenants.length === 0 ? (
        <OverviewEmptyState
          icon={Building2}
          title="No tenants yet"
          description="New tenants will show up here."
          height={200}
        />
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-2 pb-2 font-medium">Tenant</th>
                <th className="px-2 pb-2 font-medium">Status</th>
                <th className="px-2 pb-2 text-right font-medium">Users</th>
                <th className="px-2 pb-2 text-right font-medium">Clinics</th>
                <th className="px-2 pb-2 text-right font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.06] border-t border-foreground/[0.07]">
              {tenants.map((tenant) => (
                <tr
                  key={tenant.uuid}
                  className="group transition-colors hover:bg-foreground/[0.025]"
                >
                  <td className="px-2 py-3">
                    <Link
                      href={ROUTES.platformAdminTenant(tenant.uuid)}
                      className="flex items-center gap-3 outline-none"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary ring-1 ring-inset ring-primary/15">
                        {initials(tenant.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                          {tenant.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[tenant.code, tenant.city || tenant.country]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    <PlatformAdminStatusBadge
                      status={tenant.status}
                      isActive={tenant.is_active}
                    />
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-foreground">
                    {tenant.active_user_count}
                    <span className="text-muted-foreground">
                      /{tenant.user_count}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-foreground">
                    {tenant.clinic_count}
                  </td>
                  <td className="px-2 py-3 text-right text-xs text-muted-foreground">
                    {formatRelativeDate(tenant.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OverviewSection>
  );
}
