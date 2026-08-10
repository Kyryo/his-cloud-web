import type { LucideIcon } from "lucide-react";

import { ClaimsFeatureEmptyPage } from "@/features/claims/components/ClaimsUpgradeEmptyState";

type ClaimsFeatureUpgradePageProps = {
  featureName: string;
  description: string;
  icon?: LucideIcon;
  "data-testid"?: string;
};

/** Placeholder for claim sub-features that are not built yet (Claims must be entitled). */
export function ClaimsFeatureUpgradePage({
  featureName,
  description,
  icon,
  "data-testid": dataTestId,
}: ClaimsFeatureUpgradePageProps) {
  return (
    <ClaimsFeatureEmptyPage
      featureName={featureName}
      description={description}
      variant="coming_soon"
      icon={icon}
      data-testid={dataTestId}
    />
  );
}
