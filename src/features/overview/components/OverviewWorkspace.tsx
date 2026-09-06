"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import {
  OverviewActivityStream,
  OverviewCount,
  OverviewRecentClients,
  OverviewSection,
} from "@/features/overview/components/overview-workspace-sections";
import { useOverviewWorkspace } from "@/features/overview/hooks/use-overview-workspace";
import {
  buildOverviewActivityItems,
  type OverviewActivityKind,
} from "@/features/overview/utils/overview-workspace";
import { formatCompactNumber } from "@/utils/format-compact-number";

export function OverviewWorkspace() {
  const { data, isLoading } = useOverviewWorkspace();
  const [selectedKind, setSelectedKind] = useState<"all" | OverviewActivityKind>(
    "all",
  );

  const activity = buildOverviewActivityItems({
    visits: data?.visits ?? [],
    appointments: data?.appointments ?? [],
    inbox: data?.inbox ?? [],
  });
  const clients = data?.customers ?? [];

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="space-y-8" aria-busy="true">
          <div className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            ))}
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cardless Clinic Pulse Bar */}
          <dl className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-1 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <OverviewCount
              label="Active visits"
              value={data?.activeVisitCount ?? 0}
              hint={
                data?.completedVisitsToday
                  ? `${formatCompactNumber(data.completedVisitsToday)} completed today`
                  : "Currently in clinic"
              }
              href={ROUTES.activeVisits}
              indicator="emerald"
              pulse
            />
            <OverviewCount
              label="Today's schedule"
              value={data?.todaysAppointmentCount ?? 0}
              hint={
                data?.inProgressAppointmentCount
                  ? `${formatCompactNumber(data.inProgressAppointmentCount)} in progress`
                  : "Appointments booked"
              }
              href={ROUTES.appointments}
              indicator="blue"
            />
            <OverviewCount
              label="Registered clients"
              value={data?.customerCount ?? 0}
              hint={
                data?.newClientsThisMonth
                  ? `+${formatCompactNumber(data.newClientsThisMonth)} new this month`
                  : "Total patient records"
              }
              href={ROUTES.customers}
              indicator="teal"
            />
            <OverviewCount
              label="Updates & tasks"
              value={data?.inbox?.length ?? 0}
              hint="Priority inbox notifications"
              href={ROUTES.notifications}
              indicator="amber"
            />
          </dl>

          {/* Two-Column Interactive Workspace */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
            {/* Primary Operations Timeline */}
            <div className="space-y-6">
              <OverviewSection
                title="Activity"
                badge={
                  activity.length > 0 ? (
                    <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px]">
                      {activity.length} updates
                    </Badge>
                  ) : null
                }
                href={ROUTES.notifications}
                actionLabel="Inbox"
              >
                <OverviewActivityStream
                  items={activity}
                  selectedKind={selectedKind}
                  onSelectKind={setSelectedKind}
                />
              </OverviewSection>
            </div>

            <div className="space-y-8">
              <OverviewSection
                title="Recently Registered"
                badge={
                  clients.length > 0 ? (
                    <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px]">
                      {clients.length} clients
                    </Badge>
                  ) : null
                }
                href={ROUTES.customers}
                actionLabel="Directory"
              >
                <OverviewRecentClients clients={clients} />
              </OverviewSection>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
