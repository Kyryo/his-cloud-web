"use client";

import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { OH_RISK_PROFILE_REQUIRED_MESSAGE } from "@/features/occupational-health/utils/customer-has-risk-profile";

type OhRiskProfileRequiredEmptyStateProps = {
  onManageEmployment?: () => void;
};

/** Shown on an OH encounter when the customer has no active risk profile. */
export function OhRiskProfileRequiredEmptyState({
  onManageEmployment,
}: OhRiskProfileRequiredEmptyStateProps) {
  return (
    <div
      className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16"
      data-testid="oh-risk-profile-required-empty"
    >
      <EmptyState
        icon={ShieldAlert}
        title="No risk profile assigned"
        description={OH_RISK_PROFILE_REQUIRED_MESSAGE}
        action={
          onManageEmployment ? (
            <Button type="button" onClick={onManageEmployment}>
              Set up employment
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
