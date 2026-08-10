import type { LucideIcon } from "lucide-react";

import {
  ModuleEmptyState,
  ModuleEmptyStatePage,
} from "@/features/app-shell/components/ModuleEmptyState";

type ClaimsUpgradeEmptyStateProps = {
  featureName: string;
  icon?: LucideIcon;
  "data-testid"?: string;
};

/** @deprecated Prefer ModuleEmptyState — kept for existing claims imports. */
export function ClaimsUpgradeEmptyState({
  featureName,
  icon,
  "data-testid": dataTestId,
}: ClaimsUpgradeEmptyStateProps) {
  return (
    <ModuleEmptyState
      featureName={featureName}
      variant="upgrade"
      icon={icon}
      data-testid={dataTestId}
    />
  );
}

type ClaimsFeatureEmptyPageProps = {
  featureName: string;
  description: string;
  variant?: "upgrade" | "coming_soon";
  icon?: LucideIcon;
  "data-testid"?: string;
};

export function ClaimsFeatureEmptyPage({
  featureName,
  description,
  variant = "coming_soon",
  icon,
  "data-testid": dataTestId,
}: ClaimsFeatureEmptyPageProps) {
  return (
    <ModuleEmptyStatePage
      featureName={featureName}
      pageDescription={description}
      variant={variant}
      icon={icon}
      data-testid={dataTestId}
    />
  );
}
