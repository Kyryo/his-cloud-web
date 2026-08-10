import { ClaimsFeatureUpgradePage } from "@/features/claims/pages/ClaimsFeatureUpgradePage";

export default function Page() {
  return (
    <ClaimsFeatureUpgradePage
      featureName="Reconciliations"
      description="Match remittances to submitted claims and resolve payment variances."
      data-testid="claims-reconciliations-upgrade-empty-state"
    />
  );
}
