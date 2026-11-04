"use client";

import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

export function OhEmployeesEmptyState() {
  return (
    <ListPageBlankState
      icon="users"
      title="No employees yet"
      description="Clients with an employment episode will appear here. Assign employment from a client record to get started."
      data-testid="oh-employees-empty-state"
    />
  );
}
