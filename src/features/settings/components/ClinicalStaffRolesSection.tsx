"use client";

import { useEffect, useMemo, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/providers/toast-provider";

const UNASSIGNED_ROLE_VALUE = "__unassigned__";

function isClinicalStaffUser(user: OrganizationUser) {
  return (
    user.groups.includes("Clinical") ||
    user.user_role === "nurse" ||
    user.user_role === "physician"
  );
}

export function ClinicalStaffRolesSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      try {
        const response = await fetchOrganizationUsers({ pageSize: 200 });
        if (active) {
          setUsers(response.results.filter(isClinicalStaffUser));
        }
      } catch (error) {
        if (active) {
          setUsers([]);
          toast({
            title: "Could not load clinical staff",
            description:
              error instanceof Error ? error.message : "Something went wrong.",
            variant: "error",
          });
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
  }, [toast]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
      ),
    [users],
  );

  async function handleRoleChange(userId: number, userRole: OrganizationUserRole) {
    setSavingUserId(userId);
    try {
      const updatedUser = await updateOrganizationUser(userId, { user_role: userRole });
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
    <section>
      {isLoading ? (
        <PageLoader />
      ) : sortedUsers.length === 0 ? (
        <p className="text-sm text-brand-muted">
          No clinical staff found. Add users to the Clinical group in User
          Management, then assign them as a nurse or physician here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/80 text-left text-brand-muted">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Clinical role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-navy">{user.name}</div>
                    <div className="text-xs text-brand-muted">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={
                        user.user_role === "nurse" || user.user_role === "physician"
                          ? user.user_role
                          : UNASSIGNED_ROLE_VALUE
                      }
                      disabled={savingUserId === user.id}
                      onValueChange={(value) =>
                        void handleRoleChange(
                          user.id,
                          value === UNASSIGNED_ROLE_VALUE
                            ? ""
                            : (value as OrganizationUserRole),
                        )
                      }
                    >
                      <SelectTrigger className="w-full max-w-[220px]">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
