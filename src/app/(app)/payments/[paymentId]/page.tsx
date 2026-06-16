import { PaymentDetailPage } from "@/features/payments/pages/PaymentDetailPage";

type PageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { paymentId } = await params;
  return <PaymentDetailPage paymentId={paymentId} />;
}
