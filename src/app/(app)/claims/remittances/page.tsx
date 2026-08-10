import { ClaimsFeatureUpgradePage } from "@/features/claims/pages/ClaimsFeatureUpgradePage";

export default function Page() {
  return (
    <ClaimsFeatureUpgradePage
      featureName="Remittances"
      description="Review payer remittance advice and payment postings against claims."
      data-testid="claims-remittances-upgrade-empty-state"
    />
  );
}
