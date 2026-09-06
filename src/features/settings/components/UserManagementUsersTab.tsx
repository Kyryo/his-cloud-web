"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import { portalGroupLabel } from "@/constants/portal-groups";
import { AddUserDialog } from "@/features/settings/components/AddUserDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdateUserDialog } from "@/features/settings/components/UpdateUserDialog";
import { formatOrganizationUserRole } from "@/features/settings/schemas/organization-user.schema";
import { fetchOrganizationUsers } from "@/features/settings/services/user-management.service";
import type { OrganizationUser } from "@/features/settings/types/settings.types";

type UserManagementUsersTabProps = {
  isActive: boolean;
};

function userMeta(user: OrganizationUser) {
  const groups = [...new Set(user.groups)]
    .map((group) => portalGroupLabel(group))
    .join(", ");

  return [
    user.email,
    user.is_admin ? "Administrator" : "Staff",
    formatOrganizationUserRole(user.user_role),
    groups,
    user.primary_clinic?.name,
  ]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function UserManagementUsersTab({ isActive }: UserManagementUsersTabProps) {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OrganizationUser | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationUsers();
        if (active) {
          setUsers(response.results);
        }
      } catch (loadError) {
        if (active) {
          setUsers([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load users.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  function handleUserCreated(user: OrganizationUser) {
    setUsers((current) => [user, ...current]);
  }

  function handleUserUpdated(updatedUser: OrganizationUser) {
    setUsers((current) =>
      current.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }

  return (
    <>
      <SettingsPanelSection
        title="Users"
        description="Team members who can sign in to this organization."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add user
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton variant="staff" showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-400">
            No users yet. Invite a teammate to give them access.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <UserIdenticon
                    seed={user.email}
                    name={user.name}
                    className="size-9 rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-slate-400">
                      {userMeta(user)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-brand-muted hover:text-brand-navy"
                    onClick={() => setEditingUser(user)}
                  >
                    Update
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanelSection>

      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleUserCreated}
      />

      {editingUser ? (
        <UpdateUserDialog
          user={editingUser}
          open={Boolean(editingUser)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingUser(null);
            }
          }}
          onUpdated={handleUserUpdated}
        />
      ) : null}
    </>
  );
}
