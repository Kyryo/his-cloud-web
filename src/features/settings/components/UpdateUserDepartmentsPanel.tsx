"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignUserDepartmentDialog } from "@/features/settings/components/AssignUserDepartmentDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import { getDepartmentTypeLabel } from "@/features/settings/constants/department-types";
import {
  fetchUserDepartmentMemberships,
  revokeUserDepartmentMembership,
} from "@/features/settings/services/user-management.service";
import type { UserDepartmentMembership } from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

const NO_MEMBERSHIPS: UserDepartmentMembership[] = [];

type UpdateUserDepartmentsPanelProps = {
  userId: number;
  isActive: boolean;
  onChanged?: () => void;
};

export function userDepartmentsQueryKey(userId: number) {
  return ["user-department-memberships", userId] as const;
}

export function UpdateUserDepartmentsPanel({
  userId,
  isActive,
  onChanged,
}: UpdateUserDepartmentsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const membershipsQuery = useQuery({
    queryKey: userDepartmentsQueryKey(userId),
    queryFn: () => fetchUserDepartmentMemberships(userId),
    enabled: isActive,
  });
  const revoke = useMutation({
    mutationFn: (membership: UserDepartmentMembership) =>
      revokeUserDepartmentMembership(userId, membership.department_uuid),
    onSuccess: async (_data, membership) => {
      await queryClient.invalidateQueries({ queryKey: userDepartmentsQueryKey(userId) });
      onChanged?.();
      toast({
        variant: "success",
        title: "Department removed",
        description: `${membership.department_name} encounters are no longer visible to this user.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "error",
        title: "Could not remove department",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    },
  });

  const memberships = membershipsQuery.data ?? NO_MEMBERSHIPS;
  const assignedUuids = useMemo(
    () => new Set(memberships.map((item) => item.department_uuid)),
    [memberships],
  );

  const handleAssigned = () => {
    void queryClient.invalidateQueries({ queryKey: userDepartmentsQueryKey(userId) });
    onChanged?.();
  };

  if (membershipsQuery.isLoading) {
    return <UpdateUserTabLoader message="Loading department memberships..." />;
  }

  if (membershipsQuery.isError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load department memberships.
      </p>
    );
  }

  return (
    <div data-testid="update-user-departments-panel">
      {memberships.length === 0 ? (
        <OrganizationEmptyState
          message="Not a member of any department. Clinical users only see encounters of departments they belong to."
          actionLabel="Assign department"
          onAction={() => setAssignDialogOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={() => setAssignDialogOpen(true)}>
              Assign department
            </Button>
          </div>
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border">
            {memberships.map((membership) => (
              <li
                key={membership.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                data-testid="user-department-membership"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-brand-navy">
                      {membership.department_name}
                    </p>
                    <Badge variant="secondary">
                      {getDepartmentTypeLabel(membership.department_type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-brand-muted">{membership.clinic_name}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-brand-muted hover:text-red-600"
                  onClick={() => revoke.mutate(membership)}
                  disabled={revoke.isPending}
                >
                  {revoke.isPending &&
                  revoke.variables?.department_uuid === membership.department_uuid
                    ? "Removing..."
                    : "Remove"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AssignUserDepartmentDialog
        userId={userId}
        assignedDepartmentUuids={assignedUuids}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssigned={handleAssigned}
      />
    </div>
  );
}
