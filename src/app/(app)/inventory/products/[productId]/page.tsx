import { ProductDetailPage } from "@/features/inventory/pages/ProductDetailPage";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}
