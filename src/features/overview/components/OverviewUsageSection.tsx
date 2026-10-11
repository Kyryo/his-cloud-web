"use client";

import { useQuery } from "@tanstack/react-query";

import { bffRequest } from "@/lib/bff-client";
import { OverviewSectionSkeleton } from "@/features/overview/components/OverviewWorkspaceSkeleton";
import { OverviewUsageRow } from "@/features/overview/components/OverviewUsageRow";
import { visibleWorkspaceHrefs } from "@/features/overview/utils/overview-quick-links";
import type { WorkspaceUsageRow } from "@/features/overview/utils/overview-usage";

type OverviewUsageSectionProps = {
  userGroups: string[];
  enabledModules: string[];
};

export function OverviewUsageSection({
  userGroups,
  enabledModules,
}: OverviewUsageSectionProps) {
  const usage = useQuery({
    queryKey: ["workspace-usage"],
    queryFn: () => bffRequest<WorkspaceUsageRow[]>("/api/workspace-usage"),
    retry: false,
  });

  if (usage.isPending) {
    return <OverviewSectionSkeleton />;
  }

  if (!usage.data) {
    return null;
  }

  return (
    <OverviewUsageRow
      rows={usage.data}
      userGroups={userGroups}
      enabledModules={enabledModules}
      allowedHrefs={visibleWorkspaceHrefs(userGroups, enabledModules)}
    />
  );
}
