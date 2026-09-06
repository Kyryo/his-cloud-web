"use client";

import { useEffect, useMemo, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { PageLoader } from "@/components/page-loader";
import { UserIdenticon } from "@/components/UserIdenticon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import {
  CLINICAL_STAFF_ROLE_OPTIONS,
  formatOrganizationUserRole,
} from "@/features/settings/schemas/organization-user.schema";
import {
  fetchOrganizationUsers,
  updateOrganizationUser,
} from "@/features/settings/services/user-management.service";
import type {
  OrganizationUser,
  OrganizationUserRole,
} from "@/features/settings/types/settings.types";
import {
  filterClinicalStaff,
  groupClinicalStaff,
  isAssignableClinicalRole,
  isClinicalStaffUser,
} from "@/features/settings/utils/clinical-staff-roles";
import { useToast } from "@/providers/toast-provider";

const UNASSIGNED_ROLE_VALUE = "__unassigned__";

function staffMeta(user: OrganizationUser) {
  const parts = [user.email];
  if (user.primary_clinic?.name) {
    parts.push(user.primary_clinic.name);
  }
  return parts.join(" · ");
}

export function ClinicalStaffRolesSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await fetchOrganizationUsers({ pageSize: 200 });
        if (cancelled) {
          return;
        }
        setUsers(response.results.filter(isClinicalStaffUser));
      } catch (error) {
        if (cancelled) {
          return;
        }
        setUsers([]);
        toast({
          title: "Could not load clinical staff",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
          variant: "error",
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
      ),
    [users],
  );
  const visibleUsers = useMemo(
    () => filterClinicalStaff(sortedUsers, query),
    [sortedUsers, query],
  );
  const groups = useMemo(
    () => groupClinicalStaff(visibleUsers),
    [visibleUsers],
  );

  async function handleRoleChange(userId: number, userRole: OrganizationUserRole) {
    setSavingUserId(userId);
    try {
      const updatedUser = await updateOrganizationUser(userId, {
        user_role: userRole,
      });
      setUsers((current) =>
        current.map((user) => (user.id === userId ? updatedUser : user)),
      );
      toast({
        title: "Clinical role updated",
        description: `${updatedUser.name} is now ${formatOrganizationUserRole(updatedUser.user_role).toLowerCase()}.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not update clinical role",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <SettingsPanelSection
      title="Clinical staff"
      description="Assign each clinical user as a nurse or physician. Roles control what they can do in OPD."
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.settingsClinicalRoleCapabilities}>
              Role access
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.settingsUserManagement}>Manage users</Link>
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <PageLoader />
      ) : sortedUsers.length === 0 ? (
        <div className="py-6">
          <p className="text-sm text-slate-400">
            No clinical staff yet. Add users to the Clinical group, then assign
            them here as a nurse or physician.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={ROUTES.settingsUserManagement}>Open user management</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative max-w-sm">
            <AppIcon
              name="search"
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, or clinic"
              className="pl-9"
              aria-label="Search clinical staff"
            />
          </div>

          {groups.length === 0 ? (
            <p className="py-6 text-sm text-slate-400">
              No staff match “{query.trim()}”.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.id}>
                <div className="flex items-baseline justify-between gap-3 pb-2">
                  <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    {group.title}
                  </h4>
                  <p className="text-xs text-slate-400">{group.users.length}</p>
                </div>
                <ul className="divide-y divide-brand-border">
                  {group.users.map((user) => (
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-brand-navy">
                              {user.name}
                            </p>
                            {user.is_active ? null : (
                              <span className="text-xs text-slate-400">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-slate-400">
                            {staffMeta(user)}
                          </p>
                        </div>
                      </div>
                      <Select
                        value={
                          user.user_role === "nurse" ||
                          user.user_role === "physician"
                            ? user.user_role
                            : UNASSIGNED_ROLE_VALUE
                        }
                        disabled={savingUserId === user.id}
                        onValueChange={(value) => {
                          const nextRole =
                            value === UNASSIGNED_ROLE_VALUE ? "" : value;
                          if (!isAssignableClinicalRole(nextRole)) {
                            return;
                          }
                          void handleRoleChange(user.id, nextRole);
                        }}
                      >
                        <SelectTrigger
                          className="w-full sm:w-40"
                          aria-label={`Clinical role for ${user.name}`}
                        >
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLINICAL_STAFF_ROLE_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value || UNASSIGNED_ROLE_VALUE}
                              value={
                                option.value === ""
                                  ? UNASSIGNED_ROLE_VALUE
                                  : option.value
                              }
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </SettingsPanelSection>
  );
}
