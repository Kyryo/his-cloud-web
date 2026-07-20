"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddUserDialog } from "@/features/settings/components/AddUserDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateUserDialog } from "@/features/settings/components/UpdateUserDialog";
import { fetchOrganizationUsers } from "@/features/settings/services/user-management.service";
import type { OrganizationUser } from "@/features/settings/types/settings.types";

type UserManagementUsersTabProps = {
  isActive: boolean;
};

const userColumns = [
  { key: "name", label: "User" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "groups", label: "Groups" },
  { key: "clinic", label: "Primary clinic" },
  { key: "actions", label: "" },
] as const;

function formatGroups(groups: string[]) {
  if (groups.length === 0) {
    return <span className="text-sm text-brand-muted">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((group) => (
        <Badge key={group} variant="outline" className="font-normal">
          {group}
        </Badge>
      ))}
    </div>
  );
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

  const isEmpty = !isLoading && !error && users.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Users"
        description="Manage team members who can access your organization."
        showHeader={!isEmpty}
        actions={
          users.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>Add user</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : users.length === 0 ? (
          <OrganizationEmptyState
            message="No users have been added to this organization yet."
            actionLabel="Add user"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {userColumns.map((column) => (
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
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-medium text-brand-navy">{user.name}</div>
                      <div className="mt-0.5 text-xs text-brand-muted">{user.email}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={user.is_admin ? "default" : "secondary"}>
                        {user.is_admin ? "Administrator" : "Staff"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge variant={user.is_active ? "success" : "outline"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">{formatGroups(user.groups)}</td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {user.primary_clinic?.name ?? "—"}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingUser(user)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

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
