import { StockAdjustmentDetailPage } from "@/features/inventory/pages/StockAdjustmentDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <StockAdjustmentDetailPage adjustmentUuid={uuid} />;
}
