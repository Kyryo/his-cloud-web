"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { isPortalGroupName, portalGroupLabel } from "@/constants/portal-groups";
import { AddGroupDialog } from "@/features/settings/components/AddGroupDialog";
import { ManageGroupMembersDialog } from "@/features/settings/components/ManageGroupMembersDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdateGroupDialog } from "@/features/settings/components/UpdateGroupDialog";
import { fetchOrganizationGroups } from "@/features/settings/services/user-management.service";
import type { OrganizationGroup } from "@/features/settings/types/settings.types";

type UserManagementGroupsTabProps = {
  isActive: boolean;
};

export function UserManagementGroupsTab({ isActive }: UserManagementGroupsTabProps) {
  const [groups, setGroups] = useState<OrganizationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OrganizationGroup | null>(null);
  const [managingGroup, setManagingGroup] = useState<OrganizationGroup | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadGroups() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationGroups();
        if (active) {
          setGroups(response.results);
        }
      } catch (loadError) {
        if (active) {
          setGroups([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load groups.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      active = false;
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  function handleGroupCreated(group: OrganizationGroup) {
    setGroups((current) => [group, ...current]);
  }

  function handleGroupUpdated(updatedGroup: OrganizationGroup) {
    setGroups((current) =>
      current.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
    );
  }

  return (
    <>
      <SettingsPanelSection
        title="Groups"
        description="Permission sets you assign to users."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add group
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-400">
            No groups yet. Add a group to organize access.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {groups.map((group) => {
              const label = portalGroupLabel(group.name);
              const isPortalGroup = isPortalGroupName(group.name);

              return (
                <li
                  key={group.id}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {label}
                    </p>
                    {isPortalGroup ? (
                      <p className="mt-0.5 text-sm text-slate-400">
                        Built-in module group
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setManagingGroup(group)}
                    >
                      Members
                    </Button>
                    {isPortalGroup ? null : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingGroup(group)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsPanelSection>

      <AddGroupDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleGroupCreated}
        existingGroupNames={groups.map((group) => group.name)}
      />

      {editingGroup ? (
        <UpdateGroupDialog
          group={editingGroup}
          open={Boolean(editingGroup)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingGroup(null);
            }
          }}
          onUpdated={handleGroupUpdated}
        />
      ) : null}

      {managingGroup ? (
        <ManageGroupMembersDialog
          group={managingGroup}
          open={Boolean(managingGroup)}
          onOpenChange={(open) => {
            if (!open) {
              setManagingGroup(null);
            }
          }}
        />
      ) : null}
    </>
  );
}
