import { InternalOrderDetailPage } from "@/features/inventory/pages/InternalOrderDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <InternalOrderDetailPage orderUuid={uuid} />;
}
