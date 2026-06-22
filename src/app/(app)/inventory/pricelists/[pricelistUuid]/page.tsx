import { PricelistDetailPage } from "@/features/inventory/pages/PricelistDetailPage";

type PageProps = {
  params: Promise<{ pricelistUuid: string }>;
};

export default async function Page({ params }: PageProps) {
  const { pricelistUuid } = await params;
  return <PricelistDetailPage pricelistUuid={pricelistUuid} />;
}
