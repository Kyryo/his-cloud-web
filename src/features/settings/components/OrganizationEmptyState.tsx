import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type OrganizationEmptyStateProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  children?: ReactNode;
};

export function OrganizationEmptyState({
  message,
  actionLabel,
  onAction,
  actionDisabled = false,
  children,
}: OrganizationEmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-brand-muted">{message}</p>
      <div className="mt-4">
        <Button onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </Button>
      </div>
      {children}
    </div>
  );
}
