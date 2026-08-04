import { ClaimDetailPage } from "@/features/claims/pages/ClaimDetailPage";

type PageProps = {
  params: Promise<{ claimId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { claimId } = await params;
  return <ClaimDetailPage claimId={claimId} />;
}
