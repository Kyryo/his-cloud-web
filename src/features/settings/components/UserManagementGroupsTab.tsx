"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { AddGroupDialog } from "@/features/settings/components/AddGroupDialog";
import { ManageGroupMembersDialog } from "@/features/settings/components/ManageGroupMembersDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateGroupDialog } from "@/features/settings/components/UpdateGroupDialog";
import { fetchOrganizationGroups } from "@/features/settings/services/user-management.service";
import type { OrganizationGroup } from "@/features/settings/types/settings.types";

type UserManagementGroupsTabProps = {
  isActive: boolean;
};

const groupColumns = [
  { key: "name", label: "Group" },
  { key: "actions", label: "" },
] as const;

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

  const isEmpty = !isLoading && !error && groups.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Groups"
        description="Organize permissions by assigning users to groups."
        showHeader={!isEmpty}
        actions={
          groups.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>Add group</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : groups.length === 0 ? (
          <OrganizationEmptyState
            message="No permission groups have been created yet."
            actionLabel="Add group"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {groupColumns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-muted"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-6 py-3.5 text-sm font-medium text-brand-navy">
                      {group.name}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-brand-muted hover:text-brand-navy"
                          onClick={() => setManagingGroup(group)}
                        >
                          Members
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-brand-muted hover:text-brand-navy"
                          onClick={() => setEditingGroup(group)}
                        >
                          Update
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <AddGroupDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleGroupCreated}
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
