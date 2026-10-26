import type { ReactNode } from "react";

import { ClaimDetailPage } from "@/features/claims/pages/ClaimDetailPage";

type ClaimDetailLayoutProps = {
  children: ReactNode;
  tab: ReactNode;
  params: Promise<{ claimId: string }>;
};

export default async function ClaimDetailLayout({
  tab,
  params,
}: ClaimDetailLayoutProps) {
  const { claimId } = await params;
  return <ClaimDetailPage claimId={claimId}>{tab}</ClaimDetailPage>;
}
