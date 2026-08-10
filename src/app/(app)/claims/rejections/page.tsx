import { ClaimsFeatureUpgradePage } from "@/features/claims/pages/ClaimsFeatureUpgradePage";

export default function Page() {
  return (
    <ClaimsFeatureUpgradePage
      featureName="Rejections"
      description="Track denied claims and follow up on payer rejection reasons."
      data-testid="claims-rejections-upgrade-empty-state"
    />
  );
}
