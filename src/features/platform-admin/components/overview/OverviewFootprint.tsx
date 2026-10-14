import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import type { PlatformAdminDashboard } from "@/features/platform-admin/types/platform-admin.types";

type Props = { dashboard: PlatformAdminDashboard };

export function OverviewFootprint({ dashboard }: Props) {
  const activeShare =
    dashboard.total_users > 0
      ? Math.round((dashboard.active_users / dashboard.total_users) * 100)
      : null;
  const rows: { label: string; value: string; hint?: string }[] = [
    { label: "Clinics", value: dashboard.total_clinics.toLocaleString() },
    { label: "Locations", value: dashboard.total_locations.toLocaleString() },
    {
      label: "Users",
      value: dashboard.total_users.toLocaleString(),
      hint: activeShare !== null ? `${activeShare}% active` : undefined,
    },
    {
      label: "Products catalogued",
      value: dashboard.total_products.toLocaleString(),
    },
    {
      label: "Pending · Suspended tenants",
      value: `${dashboard.pending_tenants} · ${dashboard.suspended_tenants}`,
    },
  ];
  return (
    <OverviewSection title="Platform footprint">
      <dl className="divide-y divide-foreground/[0.06] border-t border-foreground/[0.07]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 py-3"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="flex items-baseline gap-2">
              {row.hint ? (
                <span className="text-xs text-muted-foreground">
                  {row.hint}
                </span>
              ) : null}
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {row.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {activeShare !== null ? (
        <div className="space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${activeShare}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {dashboard.active_users.toLocaleString()} of{" "}
            {dashboard.total_users.toLocaleString()} users active
          </p>
        </div>
      ) : null}
    </OverviewSection>
  );
}
