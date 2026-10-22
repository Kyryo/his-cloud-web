"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { fetchDepartmentMembers } from "@/features/settings/services/user-management.service";

type DepartmentMembersPanelProps = {
  departmentUuid: string;
  isActive: boolean;
};

/** Read-only list of users who belong to the department. */
export function DepartmentMembersPanel({
  departmentUuid,
  isActive,
}: DepartmentMembersPanelProps) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["department-members", departmentUuid],
    queryFn: () => fetchDepartmentMembers(departmentUuid),
    enabled: isActive && Boolean(departmentUuid),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[120px] items-center justify-center gap-2 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading members...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load department members.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="department-members-panel">
      <p className="text-xs text-brand-muted">
        Members see this department&apos;s queue and encounters. Assign users from
        Settings → User management → Departments.
      </p>
      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-brand-border px-4 py-6 text-center text-sm text-brand-muted">
          No members yet.
        </p>
      ) : (
        <ul className="divide-y divide-brand-border rounded-xl border border-brand-border">
          {data.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
              data-testid="department-member"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-navy">
                  {member.name || member.email}
                </p>
                <p className="truncate text-xs text-brand-muted">{member.email}</p>
              </div>
              {member.user_role ? (
                <span className="shrink-0 text-xs capitalize text-brand-slate">
                  {member.user_role}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
