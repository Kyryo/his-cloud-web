import { BatchDetailPage } from "@/features/inventory/pages/BatchDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <BatchDetailPage batchUuid={uuid} />;
}
