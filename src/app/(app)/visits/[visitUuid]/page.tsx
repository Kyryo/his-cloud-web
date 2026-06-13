import { VisitDetailPage } from "@/features/visits/pages/VisitDetailPage";

type PageProps = {
  params: Promise<{ visitUuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { visitUuid } = await params;
  return <VisitDetailPage visitUuid={visitUuid} />;
}
