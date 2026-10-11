import { ListPageBlankState } from "@/features/app-shell/components/page-layout";

export function IncomingReferralsEmptyState() {
  return (
    <ListPageBlankState
      icon="transfer"
      title="No pending referrals"
      description="Incoming referrals awaiting front-desk intake will appear here."
      data-testid="incoming-referrals-empty-state"
    />
  );
}
