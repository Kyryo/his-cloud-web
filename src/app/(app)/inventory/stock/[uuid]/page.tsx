import { StockDetailPage } from "@/features/inventory/pages/StockDetailPage";

type PageProps = {
  params: Promise<{ uuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;
  return <StockDetailPage stockUuid={uuid} />;
}
