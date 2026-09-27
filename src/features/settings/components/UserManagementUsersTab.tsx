"use client";

import { useEffect, useRef, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { UserIdenticon } from "@/components/UserIdenticon";
import { Button } from "@/components/ui/button";
import { portalGroupLabel } from "@/constants/portal-groups";
import {
  ListPagePagination,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { AddUserDialog } from "@/features/settings/components/AddUserDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdateUserDialog } from "@/features/settings/components/UpdateUserDialog";
import { formatOrganizationUserRole } from "@/features/settings/schemas/organization-user.schema";
import { fetchOrganizationUsers } from "@/features/settings/services/user-management.service";
import type { OrganizationUser } from "@/features/settings/types/settings.types";

type UserManagementUsersTabProps = {
  isActive: boolean;
};

const USER_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

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
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const appliedSearchRef = useRef("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      if (appliedSearchRef.current === next) {
        return;
      }
      appliedSearchRef.current = next;
      setAppliedSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationUsers({
          search: appliedSearch,
          page,
          pageSize: USER_PAGE_SIZE,
        });
        if (active) {
          setUsers(response.results);
          setTotalCount(response.pagination?.count ?? response.results.length);
          setHasNext(Boolean(response.pagination?.next));
          setHasPrevious(Boolean(response.pagination?.previous));
        }
      } catch (loadError) {
        if (active) {
          setUsers([]);
          setTotalCount(0);
          setHasNext(false);
          setHasPrevious(false);
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
  }, [appliedSearch, isActive, page, reloadToken]);

  if (!isActive) {
    return null;
  }

  function applySearch(nextSearch: string) {
    const next = nextSearch.trim();
    appliedSearchRef.current = next;
    setSearchInput(next);
    setAppliedSearch(next);
    setPage(1);
  }

  function handleSearchSubmit() {
    applySearch(searchInput);
  }

  function handleClearSearch() {
    applySearch("");
  }

  function handleUserCreated() {
    applySearch("");
    setReloadToken((current) => current + 1);
  }

  function handleUserUpdated(updatedUser: OrganizationUser) {
    setUsers((current) =>
      current.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }

  const hasActiveSearch = appliedSearch.length > 0;
  const isFilteredEmpty = !isLoading && !error && users.length === 0 && hasActiveSearch;
  const isEmpty = !isLoading && !error && users.length === 0 && !hasActiveSearch;

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
        <ListPageSearchToolbar
          search={searchInput}
          searchId="organization-user-search"
          placeholder="Search users"
          isLoading={isLoading}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={handleClearSearch}
          className="mb-4"
        />
        {isLoading ? (
          <SettingsContentSkeleton variant="staff" showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : isEmpty ? (
          <p className="text-sm text-slate-400">
            No users yet. Invite a teammate to give them access.
          </p>
        ) : isFilteredEmpty ? (
          <p className="text-sm text-slate-400">No users match this search.</p>
        ) : (
          <>
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
            <ListPagePagination
              page={page}
              pageSize={USER_PAGE_SIZE}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </>
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
