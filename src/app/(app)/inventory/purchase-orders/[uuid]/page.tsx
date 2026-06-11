import { PurchaseOrderDetailPage } from "@/features/inventory/pages/PurchaseOrderDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <PurchaseOrderDetailPage orderUuid={uuid} />;
}
