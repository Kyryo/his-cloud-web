import { ClaimsFeatureUpgradePage } from "@/features/claims/pages/ClaimsFeatureUpgradePage";

export default function Page() {
  return (
    <ClaimsFeatureUpgradePage
      featureName="Appeals"
      description="Manage claim appeals and resubmissions after payer denials."
      data-testid="claims-appeals-upgrade-empty-state"
    />
  );
}
