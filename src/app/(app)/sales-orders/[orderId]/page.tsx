import { SalesOrderDetailPage } from "@/features/sales-orders/pages/SalesOrderDetailPage";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { orderId } = await params;
  return <SalesOrderDetailPage orderId={orderId} />;
}
